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
        Schema::table('pharmacies', function (Blueprint $table) {
            $table->enum('status', ['active', 'suspended', 'inactive'])->default('active')->after('longitude');
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending')->after('status');
            $table->timestamp('verified_at')->nullable()->after('verification_status');
            $table->text('verification_notes')->nullable()->after('verified_at');
            $table->unsignedBigInteger('verified_by')->nullable()->after('verification_notes');
            
            $table->foreign('verified_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pharmacies', function (Blueprint $table) {
            $table->dropForeign(['verified_by']);
            $table->dropColumn([
                'status',
                'verification_status', 
                'verified_at',
                'verification_notes',
                'verified_by'
            ]);
        });
    }
};
