package com.linksee.common.entity

import org.babyfish.jimmer.sql.*

@Entity
@Table(name = "forum_follow")
interface ForumFollow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    @ManyToOne
    @JoinColumn(name = "follower_id")
    val follower: SysUser

    @ManyToOne
    @JoinColumn(name = "following_id")
    val following: SysUser

    @Column(name = "created_at")
    val createdAt: java.time.LocalDateTime
}