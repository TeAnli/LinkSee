package com.linksee.common.entity

import org.babyfish.jimmer.sql.*

@Entity
@Table(name = "ai_moderation_log")
interface AiModerationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    @Column(name = "content_id")
    val contentId: Long

    @Column(name = "content_type")
    val contentType: String

    @Column(name = "moderation_result")
    val moderationResult: String

    @Column(name = "violation_type")
    val violationType: String

    @Column(name = "confidence")
    val confidence: Double

    @Column(name = "action_taken")
    val actionTaken: String

    @Column(name = "reviewer_id")
    val reviewerId: Long?

    @Column(name = "review_time")
    val reviewTime: java.time.LocalDateTime?

    @Column(name = "created_at")
    val createdAt: java.time.LocalDateTime
}