package com.linksee.common.entity

import org.babyfish.jimmer.sql.*
import java.time.LocalDateTime

@Entity
interface User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    @Column(name = "username")
    val username: String

    @Column(name = "email")
    val email: String

    @Column(name = "password_hash")
    val passwordHash: String

    @Column(name = "avatar_url")
    val avatarUrl: String?

    @Column(name = "nickname")
    val nickname: String?

    @Column(name = "bio")
    val bio: String?

    @Column(name = "location")
    val location: String?

    @Column(name = "website")
    val website: String?

    @Column(name = "created_at")
    val createdAt: LocalDateTime

    @Column(name = "updated_at")
    val updatedAt: LocalDateTime

    @Column(name = "is_active")
    val isActive: Boolean

    @Column(name = "role")
    val role: String

    @OneToMany(mappedBy = "author")
    val posts: List<ForumPost>
}