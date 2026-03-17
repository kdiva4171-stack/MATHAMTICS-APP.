package com.quickmath.app.logic

import java.util.Random

data class MathQuestion(
    val a: Int,
    val b: Int,
    val op: String,
    val answer: Int,
    val options: List<Int>
)

object MathGenerator {
    private val random = Random()

    fun generate(): MathQuestion {
        val ops = listOf("+", "-", "*", "/")
        val op = ops[random.nextInt(ops.size)]
        var a: Int
        var b: Int
        var ans: Int

        when (op) {
            "+" -> {
                a = random.nextInt(20)
                b = random.nextInt(20)
                ans = a + b
            }
            "-" -> {
                a = random.nextInt(20) + 10
                b = random.nextInt(a)
                ans = a - b
            }
            "*" -> {
                a = random.nextInt(10)
                b = random.nextInt(10)
                ans = a * b
            }
            else -> {
                b = random.nextInt(9) + 1
                ans = random.nextInt(10)
                a = b * ans
            }
        }

        val options = mutableSetOf(ans)
        while (options.size < 4) {
            val offset = random.nextInt(10) - 5
            val wrong = ans + (if (offset == 0) 1 else offset)
            if (wrong >= 0) options.add(wrong)
        }

        return MathQuestion(a, b, op, ans, options.toList().shuffled())
    }
}
