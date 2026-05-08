package com.linksee.common.entity

import org.babyfish.jimmer.sql.*

@Entity
@Table(name = "forum_like_record")
interface ForumLikeRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    @ManyToOne
    @JoinColumn(name = "user_id")
    val user: SysUser

    @Column(name = "target_type")
    val targetType: String

    @Column(name = "target_id")
    val targetId: Long

    @Column(name = "action_type")
    val actionType: String

    @Column(name = "created_at")
    val createdAt: java.time.LocalDateTime

    @ManyToOne
    @JoinColumn(name = "target_id")
    @OnDissociate(DissociateAction.SET_NULL)
    val targetPost: ForumPost?

    @ManyToOne
    @JoinColumn(name = "target_id")
    @OnDissociate(DissociateAction.SET_NULL)
    val targetComment: ForumComment?
}