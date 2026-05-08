package com.linksee.common.entity

import org.babyfish.jimmer.sql.*

@Entity
@Table(name = "forum_category")
interface ForumCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    @Column(name = "name")
    val name: String

    @Column(name = "icon")
    val icon: String

    @Column(name = "parent_id")
    val parentId: Long?

    @Column(name = "description", sqlType = "TEXT")
    val description: String

    @Column(name = "sort_order")
    val sortOrder: Int

    @Column(name = "post_count")
    val postCount: Int

    @Column(name = "theme_color")
    val themeColor: String

    @Column(name = "post_template", sqlType = "JSONB")
    val postTemplate: String

    @Column(name = "ai_persona")
    val aiPersona: String

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
    val parent: ForumCategory?

    @OneToMany(mappedBy = "parent")
    val children: List<ForumCategory>

    @OneToMany(mappedBy = "category")
    val posts: List<ForumPost>
}