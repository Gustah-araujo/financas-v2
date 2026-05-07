<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Account>
 */
class AccountFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::create([
                'name' => fake()->unique()->company(),
            ])->id,
            'name' => fake()->words(2, true),
            'type' => fake()->randomElement(['checking', 'savings', 'wallet', 'investment', 'other']),
            'initial_balance' => fake()->numberBetween(0, 500_000),
        ];
    }
}
