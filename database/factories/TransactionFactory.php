<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'account_id' => Account::factory(),
            'workspace_id' => fn (array $attributes) => Account::withoutGlobalScopes()
                ->findOrFail($attributes['account_id'])
                ->workspace_id,
            'category_id' => fn (array $attributes) => Category::factory()->create([
                'workspace_id' => Account::withoutGlobalScopes()->findOrFail($attributes['account_id'])->workspace_id,
            ])->id,
            'type' => fake()->randomElement(['debit', 'credit', 'transfer_out', 'transfer_in']),
            'amount' => fake()->numberBetween(1, 100_000),
            'description' => fake()->sentence(3),
            'date' => fake()->date(),
            'transfer_id' => null,
        ];
    }
}
