package com.linksee.common.entity

import org.babyfish.jimmer.sql.*

@Entity
@Table(name = "forum_comment")
interface ForumComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    @ManyToOne
    @JoinColumn(name = "post_id")
    val post: ForumPost

    @ManyToOne
    @JoinColumn(name = "user_id")
    val user: SysUser

    @Column(name = "parent_id")
    val parentId: Long?

    @Column(name = "content", sqlType = "TEXT")
    val content: String

    @Column(name = "like_count")
    val likeCount: Int

    @Column(name = "status")
    val status: Int

    @Column(name = "created_at")
    val createdAt: java.time.LocalDateTime

    @Column(name = "updated_at")
    val updatedAt: java.time.LocalDateTime

    @Column(name = "deleted")
    val deleted: Int

    @ManyToOne
    @JoinColumn(name = "parent_id")
    val parent: ForumComment?

    @OneToMany(mappedBy = "parent")
    val replies: List<ForumComment>

    @OneToMany(mappedBy = "targetComment")
    val likeRecords: List<ForumLikeRecord>
}