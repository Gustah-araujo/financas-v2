<?php

namespace Tests\Unit;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountBalanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_balance_equals_initial_balance_when_account_has_no_transactions(): void
    {
        $account = Account::factory()->create([
            'initial_balance' => 100_000,
        ]);

        $this->assertSame(100_000, $account->balance());
    }

    public function test_balance_adds_credits_and_subtracts_debits(): void
    {
        $account = Account::factory()->create([
            'initial_balance' => 100_000,
        ]);

        Transaction::factory()->create([
            'account_id' => $account->id,
            'workspace_id' => $account->workspace_id,
            'type' => 'credit',
            'amount' => 50_000,
        ]);

        Transaction::factory()->create([
            'account_id' => $account->id,
            'workspace_id' => $account->workspace_id,
            'type' => 'debit',
            'amount' => 20_000,
        ]);

        $this->assertSame(130_000, $account->balance());
    }

    public function test_balance_includes_transfer_movements(): void
    {
        $account = Account::factory()->create([
            'initial_balance' => 100_000,
        ]);

        Transaction::factory()->create([
            'account_id' => $account->id,
            'workspace_id' => $account->workspace_id,
            'type' => 'transfer_out',
            'amount' => 30_000,
        ]);

        Transaction::factory()->create([
            'account_id' => $account->id,
            'workspace_id' => $account->workspace_id,
            'type' => 'transfer_in',
            'amount' => 20_000,
        ]);

        $this->assertSame(90_000, $account->balance());
    }

    public function test_balance_can_be_negative(): void
    {
        $account = Account::factory()->create([
            'initial_balance' => 100_000,
        ]);

        Transaction::factory()->create([
            'account_id' => $account->id,
            'workspace_id' => $account->workspace_id,
            'type' => 'debit',
            'amount' => 200_000,
        ]);

        $this->assertSame(-100_000, $account->balance());
    }
}
