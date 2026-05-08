package com.linksee.common.entity

import org.babyfish.jimmer.sql.*

@Entity
@Table(name = "forum_post")
interface ForumPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    @ManyToOne
    @JoinColumn(name = "author_id")
    val author: SysUser

    @ManyToOne
    @JoinColumn(name = "category_id")
    val category: ForumCategory

    @Column(name = "title", length = 200)
    val title: String

    @Column(name = "content", sqlType = "TEXT")
    val content: String

    @Column(name = "cover_image_url", length = 500)
    val coverImageUrl: String

    @Column(name = "summary", sqlType = "TEXT")
    val summary: String

    @Column(name = "tag_list", sqlType = "JSONB")
    val tagList: String

    @Column(name = "view_count")
    val viewCount: Int

    @Column(name = "like_count")
    val likeCount: Int

    @Column(name = "comment_count")
    val commentCount: Int

    @Column(name = "collect_count")
    val collectCount: Int

    @Column(name = "status")
    val status: Int

    @Column(name = "is_top")
    val isTop: Boolean

    @Column(name = "is_essence")
    val isEssence: Boolean

    @Column(name = "sort_weight")
    val sortWeight: Double

    @Column(name = "published_at")
    val publishedAt: java.time.LocalDateTime?

    @Column(name = "created_at")
    val createdAt: java.time.LocalDateTime

    @Column(name = "updated_at")
    val updatedAt: java.time.LocalDateTime

    @Column(name = "deleted")
    val deleted: Int

    @OneToMany(mappedBy = "post")
    val comments: List<ForumComment>

    @OneToMany(mappedBy = "targetPost")
    val likeRecords: List<ForumLikeRecord>
}