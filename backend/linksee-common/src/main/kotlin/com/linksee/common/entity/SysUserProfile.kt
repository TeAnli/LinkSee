package com.linksee.common.entity

import org.babyfish.jimmer.sql.*

@Entity
@Table(name = "sys_user_profile")
interface SysUserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    @OneToOne
    @JoinColumn(name = "user_id")
    val user: SysUser

    @Column(name = "bio", sqlType = "TEXT")
    val bio: String

    @Column(name = "location")
    val location: String

    @Column(name = "personal_website")
    val personalWebsite: String

    @Column(name = "social_links", sqlType = "JSONB")
    val socialLinks: String

    @Column(name = "skills_tags", sqlType = "JSONB")
    val skillsTags: String

    @Column(name = "education")
    val education: String

    @Column(name = "occupation")
    val occupation: String

    @Column(name = "is_verified")
    val isVerified: Boolean

    @Column(name = "verify_info")
    val verifyInfo: String

    @Column(name = "follower_count")
    val followerCount: Int

    @Column(name = "following_count")
    val followingCount: Int

    @Column(name = "created_at")
    val createdAt: java.time.LocalDateTime

    @Column(name = "updated_at")
    val updatedAt: java.time.LocalDateTime
}