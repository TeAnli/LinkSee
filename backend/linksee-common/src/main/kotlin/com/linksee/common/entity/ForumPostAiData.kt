package com.linksee.common.entity

import org.babyfish.jimmer.sql.*

@Entity
@Table(name = "forum_post_ai_data")
interface ForumPostAiData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    @OneToOne
    @JoinColumn(name = "post_id")
    val post: ForumPost

    @Column(name = "ai_summary", sqlType = "TEXT")
    val aiSummary: String

    @Column(name = "ai_keywords", sqlType = "JSONB")
    val aiKeywords: String

    @Column(name = "sentiment_score")
    val sentimentScore: Double

    @Column(name = "quality_score")
    val qualityScore: Double

    @Column(name = "read_duration_estimate")
    val readDurationEstimate: Int

    @Column(name = "vector_id")
    val vectorId: String

    @Column(name = "created_at")
    val createdAt: java.time.LocalDateTime

    @Column(name = "updated_at")
    val updatedAt: java.time.LocalDateTime
}