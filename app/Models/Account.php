<?php

namespace App\Models;

use App\Models\Concerns\BelongsToWorkspace;
use Database\Factories\AccountFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'type', 'initial_balance'])]
class Account extends Model
{
    /** @use HasFactory<AccountFactory> */
    use BelongsToWorkspace, HasFactory;

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function balance(): int
    {
        return (int) $this->initial_balance
            + (int) $this->transactions()->where('type', 'credit')->sum('amount')
            - (int) $this->transactions()->where('type', 'debit')->sum('amount')
            - (int) $this->transactions()->where('type', 'transfer_out')->sum('amount')
            + (int) $this->transactions()->where('type', 'transfer_in')->sum('amount');
    }

    public function hasTransactions(): bool
    {
        return $this->transactions()->exists();
    }

    protected function casts(): array
    {
        return [
            'initial_balance' => 'integer',
        ];
    }
}
