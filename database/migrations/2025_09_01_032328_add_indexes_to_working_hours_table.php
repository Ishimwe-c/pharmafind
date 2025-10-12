<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('working_hours', function (Blueprint $table) {
            // Check if indexes don't already exist before adding them
            if (!$this->indexExists('working_hours', 'working_hours_day_of_week_pharmacy_id_index')) {
                $table->index(['day_of_week', 'pharmacy_id']);
            }
            
            if (!$this->indexExists('working_hours', 'working_hours_closed_index')) {
                $table->index('closed');
            }
        });
    }

    /**
     * Check if an index exists on a table
     */
    private function indexExists($table, $index)
    {
        $indexes = \DB::select("SHOW INDEX FROM {$table}");
        foreach ($indexes as $idx) {
            if ($idx->Key_name === $index) {
                return true;
            }
        }
        return false;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('working_hours', function (Blueprint $table) {
            //
        });
    }
};
