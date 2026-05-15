import datetime

from sqlalchemy import and_, func, or_, select, text, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants import (
    ERR_CATEGORY_NOT_FOUND,
    ERR_CONTENT_SENSITIVE,
    ERR_NO_EDIT_PERMISSION,
    ERR_POST_NOT_FOUND,
    POST_STATUS_PUBLISHED,
    POST_STATUS_REVIEWING,
)
from app.exceptions import AppException
from app.models.ai_moderation import AiModerationLog
from app.models.category import ForumCategory
from app.models.comment import ForumComment
from app.models.follow import ForumFollow
from app.models.like_record import ForumLikeRecord
from app.models.post import ForumPost
from app.models.post_ai_data import ForumPostAiData
from app.models.user import SysUser
from app.models.user_profile import SysUserProfile
from app.schemas.forum import PostCreateRequest, PostUpdateRequest


async def get_categories(db: AsyncSession, include_stats: bool = False) -> list[dict]:
    stmt = select(ForumCategory).where(ForumCategory.deleted == 0, ForumCategory.status == 1).order_by(ForumCategory.sort_order)
    result = await db.execute(stmt)
    categories = result.scalars().all()

    nodes = {}
    for cat in categories:
        nodes[cat.id] = {
            "id": cat.id,
            "name": cat.name,
            "icon": cat.icon,
            "description": cat.description,
            "themeColor": cat.theme_color,
            "postCount": cat.post_count,
            "sortOrder": cat.sort_order,
            "parentId": cat.parent_id,
            "children": [],
        }

    roots = []
    for cat in categories:
        node = nodes[cat.id]
        if cat.parent_id and cat.parent_id in nodes:
            nodes[cat.parent_id]["children"].append(node)
        else:
            roots.append(node)
    return roots


async def get_category_detail(db: AsyncSession, category_id: int) -> dict:
    cat = await db.get(ForumCategory, category_id)
    if not cat or cat.deleted:
        raise AppException(ERR_CATEGORY_NOT_FOUND, "板块不存在", 404)

    category_info = {
        "id": cat.id, "name": cat.name, "icon": cat.icon,
        "description": cat.description, "themeColor": cat.theme_color,
        "postCount": cat.post_count, "postTemplate": cat.post_template,
        "aiPersona": cat.ai_persona,
    }

    # Top posts
    top_stmt = (
        select(ForumPost)
        .where(ForumPost.category_id == category_id, ForumPost.deleted == 0, ForumPost.status == POST_STATUS_PUBLISHED, ForumPost.is_top == True)
        .order_by(ForumPost.published_at.desc())
        .limit(5)
    )
    top_posts = await _posts_to_brief(db, top_stmt)

    # Essence posts
    ess_stmt = (
        select(ForumPost)
        .where(ForumPost.category_id == category_id, ForumPost.deleted == 0, ForumPost.status == POST_STATUS_PUBLISHED, ForumPost.is_essence == True)
        .order_by(ForumPost.published_at.desc())
        .limit(5)
    )
    ess_posts = await _posts_to_brief(db, ess_stmt)

    return {"categoryInfo": category_info, "topPosts": top_posts, "essencePosts": ess_posts}


async def create_post(db: AsyncSession, user_id: int, req: PostCreateRequest) -> dict:
    cat = await db.get(ForumCategory, req.categoryId)
    if not cat or cat.deleted:
        raise AppException(ERR_CATEGORY_NOT_FOUND, "板块不存在", 404)

    post = ForumPost(
        author_id=user_id,
        category_id=req.categoryId,
        title=req.title,
        content=req.content,
        tag_list=req.tagList or [],
        cover_image_url=req.coverImageUrl or "",
        status=POST_STATUS_REVIEWING,
        published_at=datetime.datetime.now(datetime.timezone.utc),
    )
    db.add(post)
    await db.flush()

    # Update category post count
    cat.post_count = (cat.post_count or 0) + 1
    await db.flush()

    return {"postId": post.id, "status": post.status, "message": "帖子已提交，正在审核中..."}


async def get_post_detail(db: AsyncSession, post_id: int, viewer_id: int | None = None) -> dict | None:
    post = await db.get(ForumPost, post_id)
    if not post or post.deleted:
        raise AppException(ERR_POST_NOT_FOUND, "帖子不存在", 404)

    author = await db.get(SysUser, post.author_id)
    if not author:
        raise AppException(ERR_POST_NOT_FOUND, "帖子不存在", 404)
    profile = await db.execute(select(SysUserProfile).where(SysUserProfile.user_id == post.author_id))
    profile = profile.scalar()

    # Increment view count
    post.view_count = (post.view_count or 0) + 1
    await db.flush()

    author_data = {
        "id": author.id, "nickname": author.nickname or author.username,
        "avatarUrl": author.avatar_url, "level": author.level,
        "bio": profile.bio if profile else "",
        "postCount": 0, "followerCount": profile.follower_count if profile else 0,
        "isFollowed": False,
    }
    if viewer_id:
        follow = await db.execute(
            select(ForumFollow).where(ForumFollow.follower_id == viewer_id, ForumFollow.following_id == author.id)
        )
        author_data["isFollowed"] = follow.scalar() is not None

    ai_data = await db.execute(select(ForumPostAiData).where(ForumPostAiData.post_id == post.id))
    ai_row = ai_data.scalar()
    ai_data_resp = None
    if ai_row:
        ai_data_resp = {
            "aiSummary": ai_row.ai_summary, "aiKeywords": ai_row.ai_keywords or [],
            "qualityScore": ai_row.quality_score, "estimatedReadTime": ai_row.estimated_read_minutes,
        }

    is_liked = False
    is_collected = False
    if viewer_id:
        like_check = await db.execute(
            select(ForumLikeRecord).where(
                ForumLikeRecord.user_id == viewer_id,
                ForumLikeRecord.target_type == "post",
                ForumLikeRecord.target_id == post.id,
            )
        )
        for rec in like_check.scalars():
            if rec.action_type == "like":
                is_liked = True
            elif rec.action_type == "collect":
                is_collected = True

    cat = await db.get(ForumCategory, post.category_id)

    return {
        "post": {
            "id": post.id, "title": post.title, "content": post.content,
            "summary": post.summary, "coverImageUrl": post.cover_image_url,
            "tagList": post.tag_list or [], "categoryId": post.category_id,
            "categoryName": cat.name if cat else "",
            "viewCount": post.view_count, "likeCount": post.like_count,
            "commentCount": post.comment_count, "collectCount": post.collect_count,
            "status": post.status, "isTop": post.is_top, "isEssence": post.is_essence,
            "authorId": post.author_id, "authorNickname": author.nickname or author.username,
            "authorAvatarUrl": author.avatar_url, "authorLevel": author.level,
            "publishedAt": post.published_at.isoformat() if post.published_at else None,
            "createdAt": post.created_at.isoformat() if post.created_at else None,
        },
        "author": author_data,
        "aiData": ai_data_resp,
        "isLiked": is_liked,
        "isCollected": is_collected,
    }


async def update_post(db: AsyncSession, post_id: int, user_id: int, req: PostUpdateRequest) -> dict:
    post = await db.get(ForumPost, post_id)
    if not post or post.deleted:
        raise AppException(ERR_POST_NOT_FOUND, "帖子不存在", 404)
    if post.author_id != user_id:
        raise AppException(ERR_NO_EDIT_PERMISSION, "无权编辑", 403)

    update_data = {}
    if req.title is not None:
        update_data["title"] = req.title
    if req.content is not None:
        update_data["content"] = req.content
    if req.tagList is not None:
        update_data["tag_list"] = req.tagList
    if req.categoryId is not None:
        update_data["category_id"] = req.categoryId
    if req.coverImageUrl is not None:
        update_data["cover_image_url"] = req.coverImageUrl

    if update_data:
        stmt = update(ForumPost).where(ForumPost.id == post_id).values(**update_data)
        await db.execute(stmt)
        await db.flush()

    return {"postId": post_id}


async def delete_post(db: AsyncSession, post_id: int, user_id: int):
    post = await db.get(ForumPost, post_id)
    if not post or post.deleted:
        raise AppException(ERR_POST_NOT_FOUND, "帖子不存在", 404)
    if post.author_id != user_id:
        raise AppException(ERR_NO_EDIT_PERMISSION, "无权编辑", 403)
    post.deleted = 1
    await db.flush()


async def list_posts(
    db: AsyncSession, category_id: int | None = None, sort: str = "hot",
    tag: str | None = None, keyword: str | None = None,
    author_id: int | None = None, page: int = 1, size: int = 20,
) -> dict:
    conditions = [
        ForumPost.deleted == 0,
        ForumPost.status.in_([POST_STATUS_PUBLISHED, POST_STATUS_REVIEWING]),
    ]
    if category_id:
        conditions.append(ForumPost.category_id == category_id)
    if author_id:
        conditions.append(ForumPost.author_id == author_id)
    if keyword:
        conditions.append(or_(ForumPost.title.ilike(f"%{keyword}%"), ForumPost.summary.ilike(f"%{keyword}%")))
    if tag:
        conditions.append(ForumPost.tag_list.contains([tag]))

    count_stmt = select(func.count(ForumPost.id)).where(and_(*conditions))
    total = (await db.execute(count_stmt)).scalar()

    order_map = {
        "hot": ForumPost.sort_weight.desc(),
        "latest": ForumPost.published_at.desc(),
        "essence": ForumPost.is_essence.desc(),
    }
    order = order_map.get(sort, ForumPost.sort_weight.desc())

    stmt = (
        select(ForumPost)
        .where(and_(*conditions))
        .order_by(order)
        .offset((page - 1) * size)
        .limit(size)
    )
    result = await db.execute(stmt)
    posts = result.scalars().all()

    items = []
    for p in posts:
        author = await db.get(SysUser, p.author_id)
        cat = await db.get(ForumCategory, p.category_id)
        items.append({
            "id": p.id, "title": p.title, "summary": p.summary,
            "coverImageUrl": p.cover_image_url, "tagList": p.tag_list or [],
            "categoryId": p.category_id, "categoryName": cat.name if cat else "",
            "viewCount": p.view_count, "likeCount": p.like_count, "commentCount": p.comment_count,
            "collectCount": p.collect_count, "isTop": p.is_top, "isEssence": p.is_essence,
            "author": {"id": author.id, "nickname": author.nickname or author.username, "avatarUrl": author.avatar_url, "level": author.level} if author else None,
            "publishedAt": p.published_at.isoformat() if p.published_at else None,
        })

    return {"total": total, "page": page, "size": size, "hasMore": (page * size) < total, "list": items}


async def create_comment(db: AsyncSession, post_id: int, user_id: int, content: str, parent_id: int | None = None, reply_user_id: int | None = None):
    post = await db.get(ForumPost, post_id)
    if not post or post.deleted:
        raise AppException(ERR_POST_NOT_FOUND, "帖子不存在", 404)

    comment = ForumComment(post_id=post_id, user_id=user_id, content=content, parent_id=parent_id)
    db.add(comment)
    post.comment_count = (post.comment_count or 0) + 1
    await db.flush()
    return {"commentId": comment.id, "pointsEarned": 2}


async def list_comments(
    db: AsyncSession, post_id: int, sort_by: str = "latest",
    page: int = 1, size: int = 20, root_only: bool = False, viewer_id: int | None = None,
) -> dict:
    conditions = [ForumComment.post_id == post_id, ForumComment.deleted == 0, ForumComment.status == 1]
    if root_only:
        conditions.append(ForumComment.parent_id.is_(None))

    count_stmt = select(func.count(ForumComment.id)).where(and_(*conditions))
    total = (await db.execute(count_stmt)).scalar()

    order = ForumComment.created_at.desc() if sort_by == "latest" else ForumComment.like_count.desc()
    stmt = (
        select(ForumComment).where(and_(*conditions)).order_by(order).offset((page - 1) * size).limit(size)
    )
    result = await db.execute(stmt)
    comments = result.scalars().all()

    items = []
    for c in comments:
        author = await db.get(SysUser, c.user_id)
        item = {
            "id": c.id, "content": c.content, "likeCount": c.like_count,
            "isLiked": False, "createdAt": c.created_at.isoformat() if c.created_at else None,
            "author": {"id": author.id, "nickname": author.nickname or author.username, "avatarUrl": author.avatar_url, "level": author.level} if author else None,
            "replyTo": None, "childCount": 0, "children": [],
        }
        if c.parent_id:
            parent = await db.get(ForumComment, c.parent_id)
            if parent:
                pa = await db.get(SysUser, parent.user_id)
                item["replyTo"] = {"userId": pa.id, "nickname": pa.nickname or pa.username} if pa else None

        # Count children
        child_count = await db.execute(
            select(func.count(ForumComment.id)).where(ForumComment.parent_id == c.id, ForumComment.deleted == 0, ForumComment.status == 1)
        )
        item["childCount"] = child_count.scalar()

        # Get up to 3 children
        if not root_only and item["childCount"] > 0:
            child_stmt = (
                select(ForumComment).where(ForumComment.parent_id == c.id, ForumComment.deleted == 0, ForumComment.status == 1)
                .order_by(ForumComment.created_at.asc()).limit(3)
            )
            child_result = await db.execute(child_stmt)
            for ch in child_result.scalars():
                ch_auth = await db.get(SysUser, ch.user_id)
                ch_item = {
                    "id": ch.id, "content": ch.content, "likeCount": ch.like_count, "isLiked": False,
                    "createdAt": ch.created_at.isoformat() if ch.created_at else None,
                    "author": {"id": ch_auth.id, "nickname": ch_auth.nickname or ch_auth.username, "avatarUrl": ch_auth.avatar_url, "level": ch_auth.level} if ch_auth else None,
                    "replyTo": item["replyTo"], "childCount": 0, "children": [],
                }
                item["children"].append(ch_item)

        items.append(item)

    return {"total": total, "hasMore": (page * size) < total, "list": items}


async def delete_comment(db: AsyncSession, comment_id: int, user_id: int):
    comment = await db.get(ForumComment, comment_id)
    if not comment or comment.deleted:
        raise AppException(ERR_POST_NOT_FOUND, "评论不存在", 404)
    if comment.user_id != user_id:
        raise AppException(ERR_NO_EDIT_PERMISSION, "无权删除", 403)
    comment.deleted = 1
    await db.flush()


async def toggle_like(db: AsyncSession, user_id: int, post_id: int) -> dict:
    post = await db.get(ForumPost, post_id)
    if not post or post.deleted:
        raise AppException(ERR_POST_NOT_FOUND, "帖子不存在", 404)

    existing = await db.execute(
        select(ForumLikeRecord).where(
            ForumLikeRecord.user_id == user_id,
            ForumLikeRecord.target_type == "post",
            ForumLikeRecord.target_id == post_id,
            ForumLikeRecord.action_type == "like",
        )
    )
    existing = existing.scalar()

    if existing:
        await db.delete(existing)
        post.like_count = max(0, (post.like_count or 0) - 1)
        await db.flush()
        return {"liked": False, "likeCount": post.like_count}
    else:
        record = ForumLikeRecord(user_id=user_id, target_type="post", target_id=post_id, action_type="like")
        db.add(record)
        post.like_count = (post.like_count or 0) + 1
        await db.flush()
        return {"liked": True, "likeCount": post.like_count}


async def toggle_collect(db: AsyncSession, user_id: int, post_id: int) -> dict:
    post = await db.get(ForumPost, post_id)
    if not post or post.deleted:
        raise AppException(ERR_POST_NOT_FOUND, "帖子不存在", 404)

    existing = await db.execute(
        select(ForumLikeRecord).where(
            ForumLikeRecord.user_id == user_id,
            ForumLikeRecord.target_type == "post",
            ForumLikeRecord.target_id == post_id,
            ForumLikeRecord.action_type == "collect",
        )
    )
    existing = existing.scalar()

    if existing:
        await db.delete(existing)
        post.collect_count = max(0, (post.collect_count or 0) - 1)
        await db.flush()
        return {"collected": False, "collectCount": post.collect_count}
    else:
        record = ForumLikeRecord(user_id=user_id, target_type="post", target_id=post_id, action_type="collect")
        db.add(record)
        post.collect_count = (post.collect_count or 0) + 1
        await db.flush()
        return {"collected": True, "collectCount": post.collect_count}


async def toggle_follow(db: AsyncSession, follower_id: int, following_id: int) -> dict:
    if follower_id == following_id:
        raise AppException(40000, "不能关注自己")

    target = await db.get(SysUser, following_id)
    if not target or target.deleted:
        raise AppException(40000, "用户不存在", 404)

    existing = await db.execute(
        select(ForumFollow).where(ForumFollow.follower_id == follower_id, ForumFollow.following_id == following_id)
    )
    existing = existing.scalar()

    # Update profile counts
    follower_profile = await db.execute(select(SysUserProfile).where(SysUserProfile.user_id == follower_id))
    follower_profile = follower_profile.scalar()
    target_profile = await db.execute(select(SysUserProfile).where(SysUserProfile.user_id == following_id))
    target_profile = target_profile.scalar()

    if existing:
        await db.delete(existing)
        if follower_profile:
            follower_profile.following_count = max(0, (follower_profile.following_count or 0) - 1)
        if target_profile:
            target_profile.follower_count = max(0, (target_profile.follower_count or 0) - 1)
        await db.flush()
        return {"followed": False, "followerCount": target_profile.follower_count if target_profile else 0}
    else:
        follow = ForumFollow(follower_id=follower_id, following_id=following_id)
        db.add(follow)
        if follower_profile:
            follower_profile.following_count = (follower_profile.following_count or 0) + 1
        if target_profile:
            target_profile.follower_count = (target_profile.follower_count or 0) + 1
        await db.flush()
        return {"followed": True, "followerCount": target_profile.follower_count if target_profile else 0}


async def get_favorites(db: AsyncSession, user_id: int, sort_by: str = "latest", page: int = 1, size: int = 20) -> dict:
    sub = select(ForumLikeRecord.target_id).where(
        ForumLikeRecord.user_id == user_id,
        ForumLikeRecord.target_type == "post",
        ForumLikeRecord.action_type == "collect",
    )
    count_stmt = select(func.count(ForumPost.id)).where(ForumPost.id.in_(sub), ForumPost.deleted == 0)
    total = (await db.execute(count_stmt)).scalar()

    order = ForumPost.published_at.desc() if sort_by == "latest" else ForumPost.sort_weight.desc()
    stmt = (
        select(ForumPost).where(ForumPost.id.in_(sub), ForumPost.deleted == 0)
        .order_by(order).offset((page - 1) * size).limit(size)
    )
    result = await db.execute(stmt)
    posts = result.scalars().all()

    items = []
    for p in posts:
        author = await db.get(SysUser, p.author_id)
        cat = await db.get(ForumCategory, p.category_id)
        items.append({
            "id": p.id, "title": p.title, "summary": p.summary,
            "coverImageUrl": p.cover_image_url, "tagList": p.tag_list or [],
            "categoryId": p.category_id, "categoryName": cat.name if cat else "",
            "viewCount": p.view_count, "likeCount": p.like_count,
            "commentCount": p.comment_count, "collectCount": p.collect_count,
            "isTop": p.is_top, "isEssence": p.is_essence,
            "author": {"id": author.id, "nickname": author.nickname or author.username, "avatarUrl": author.avatar_url, "level": author.level} if author else None,
            "publishedAt": p.published_at.isoformat() if p.published_at else None,
        })

    return {"total": total, "page": page, "size": size, "hasMore": (page * size) < total, "list": items}


async def _posts_to_brief(db, stmt):
    result = await db.execute(stmt)
    posts = result.scalars().all()
    items = []
    for p in posts:
        author = await db.get(SysUser, p.author_id)
        items.append({
            "id": p.id, "title": p.title,
            "author": {"id": author.id, "nickname": author.nickname or author.username, "avatarUrl": author.avatar_url} if author else None,
            "viewCount": p.view_count, "commentCount": p.comment_count,
            "publishedAt": p.published_at.isoformat() if p.published_at else None,
        })
    return items
