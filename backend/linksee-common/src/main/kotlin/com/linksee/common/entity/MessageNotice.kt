package com.linksee.common.entity

import org.babyfish.jimmer.sql.*

@Entity
@Table(name = "message_notice")
interface MessageNotice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    @Column(name = "notice_type")
    val noticeType: String

    @Column(name = "title")
    val title: String

    @Column(name = "content", sqlType = "TEXT")
    val content: String

    @Column(name = "receiver_id")
    val receiverId: Long

    @Column(name = "sender_id")
    val senderId: Long?

    @Column(name = "is_read")
    val isRead: Boolean

    @Column(name = "target_type")
    val targetType: String

    @Column(name = "target_id")
    val targetId: Long

    @Column(name = "extra_data", sqlType = "JSONB")
    val extraData: String

    @Column(name = "created_at")
    val createdAt: java.time.LocalDateTime

    @Column(name = "updated_at")
    val updatedAt: java.time.LocalDateTime

    @Column(name = "deleted")
    val deleted: Int
}