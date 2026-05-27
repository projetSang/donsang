<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('contact_messages')) {
            return;
        }

        Schema::table('contact_messages', function (Blueprint $table) {
            if (!Schema::hasColumn('contact_messages', 'type')) {
                $table->string('type')->default('user')->after('id');
            }
            if (!Schema::hasColumn('contact_messages', 'phone')) {
                $table->string('phone')->nullable()->after('email');
            }
            if (!Schema::hasColumn('contact_messages', 'hospital_name')) {
                $table->string('hospital_name')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('contact_messages', 'city')) {
                $table->string('city')->nullable()->after('hospital_name');
            }
            if (!Schema::hasColumn('contact_messages', 'address')) {
                $table->string('address')->nullable()->after('city');
            }
            if (!Schema::hasColumn('contact_messages', 'status')) {
                $table->string('status')->default('pending')->after('message');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('contact_messages')) {
            return;
        }

        Schema::table('contact_messages', function (Blueprint $table) {
            if (Schema::hasColumn('contact_messages', 'status')) {
                $table->dropColumn('status');
            }
            if (Schema::hasColumn('contact_messages', 'address')) {
                $table->dropColumn('address');
            }
            if (Schema::hasColumn('contact_messages', 'city')) {
                $table->dropColumn('city');
            }
            if (Schema::hasColumn('contact_messages', 'hospital_name')) {
                $table->dropColumn('hospital_name');
            }
            if (Schema::hasColumn('contact_messages', 'phone')) {
                $table->dropColumn('phone');
            }
            if (Schema::hasColumn('contact_messages', 'type')) {
                $table->dropColumn('type');
            }
        });
    }
};
