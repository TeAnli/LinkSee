package com.linksee.common.entity

import org.babyfish.jimmer.sql.*

@Entity
@Table(name = "ai_task_record")
interface AiTaskRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long

    @ManyToOne
    @JoinColumn(name = "user_id")
    val user: SysUser

    @Column(name = "task_type")
    val taskType: String

    @Column(name = "input_summary", sqlType = "TEXT")
    val inputSummary: String

    @Column(name = "output_content", sqlType = "TEXT")
    val outputContent: String?

    @Column(name = "model_used")
    val modelUsed: String

    @Column(name = "tokens_input")
    val tokensInput: Int

    @Column(name = "tokens_output")
    val tokensOutput: Int

    @Column(name = "response_ms")
    val responseMs: Int

    @Column(name = "status")
    val status: Int

    @Column(name = "error_message", sqlType = "TEXT")
    val errorMessage: String

    @Column(name = "target_type")
    val targetType: String

    @Column(name = "target_id")
    val targetId: Long

    @Column(name = "created_at")
    val createdAt: java.time.LocalDateTime
}