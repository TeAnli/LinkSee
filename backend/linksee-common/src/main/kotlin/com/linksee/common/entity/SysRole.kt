package com.linksee.common.entity

import org.babyfish.jimmer.sql.*

@Entity
@Table(name = "sys_role")
interface SysRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    @Column(name = "role_code")
    val roleCode: String

    @Column(name = "role_name")
    val roleName: String

    @Column(name = "description")
    val description: String

    @Column(name = "permissions", sqlType = "JSONB")
    val permissions: String

    @Column(name = "status")
    val status: Int

    @Column(name = "created_at")
    val createdAt: java.time.LocalDateTime

    @Column(name = "updated_at")
    val updatedAt: java.time.LocalDateTime

    @Column(name = "deleted")
    val deleted: Int

    @ManyToMany
    @JoinTable(
        name = "sys_user_role",
        joinColumnName = "role_id",
        inverseJoinColumnName = "user_id"
    )
    val users: List<SysUser>
}