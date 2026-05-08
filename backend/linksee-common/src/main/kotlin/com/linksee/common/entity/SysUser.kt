package com.linksee.common.entity

import org.babyfish.jimmer.sql.*
import org.babyfish.jimmer.sql.meta.UUIDIdGenerator

@Entity
@Table(name = "sys_user")
interface SysUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    @Column(name = "username")
    val username: String

    @Column(name = "password_hash")
    val passwordHash: String

    @Column(name = "nickname")
    val nickname: String

    @Column(name = "avatar_url")
    val avatarUrl: String

    @Column(name = "email")
    val email: String

    @Column(name = "phone")
    val phone: String

    @Column(name = "level")
    val level: Int

    @Column(name = "experience")
    val experience: Int

    @Column(name = "daily_ai_calls")
    val dailyAiCalls: Int

    @Column(name = "status")
    val status: Int

    @Column(name = "last_login_at")
    val lastLoginAt: java.time.LocalDateTime?

    @Column(name = "created_at")
    val createdAt: java.time.LocalDateTime

    @Column(name = "updated_at")
    val updatedAt: java.time.LocalDateTime

    @Column(name = "deleted")
    val deleted: Int

    @OneToOne(mappedBy = "user")
    val profile: SysUserProfile?

    @ManyToMany(mappedBy = "users")
    val roles: List<SysRole>
}