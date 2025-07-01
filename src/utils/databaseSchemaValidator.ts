
import { supabase } from '@/integrations/supabase/client';

export interface SchemaValidationResult {
  table: string;
  exists: boolean;
  columns: string[];
  missingColumns: string[];
  extraColumns: string[];
  hasRLS: boolean;
  policies: string[];
  indexes: string[];
  errors: string[];
}

export interface DatabaseSchemaReport {
  overall: boolean;
  tables: SchemaValidationResult[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    missingTables: string[];
  };
}

// Expected schema based on our types
const EXPECTED_SCHEMA = {
  profiles: {
    columns: [
      'user_id',
      'full_name',
      'phone',
      'email',
      'avatar_url',
      'bio',
      'rank',
      'points',
      'total_matches',
      'wins',
      'losses',
      'win_rate',
      'created_at',
      'updated_at',
      'last_active',
      'is_verified',
      'preferences',
    ],
    required: ['user_id', 'full_name', 'phone'],
  },
  clubs: {
    columns: [
      'id',
      'name',
      'address',
      'description',
      'phone',
      'email',
      'hourly_rate',
      'table_count',
      'available_tables',
      'latitude',
      'longitude',
      'logo_url',
      'opening_hours',
      'status',
      'owner_id',
      'province_id',
      'created_at',
      'updated_at',
      'is_sabo_owned',
      'monthly_payment',
      'priority_score',
    ],
    required: ['id', 'name', 'address'],
  },
  tournaments: {
    columns: [
      'id',
      'name',
      'description',
      'start_date',
      'end_date',
      'entry_fee',
      'max_participants',
      'current_participants',
      'status',
      'created_by',
      'club_id',
      'venue_address',
      'bracket_type',
      'game_format',
      'rules',
      'prize_pool',
      'first_prize',
      'second_prize',
      'third_prize',
      'first_prize_percent',
      'second_prize_percent',
      'third_prize_percent',
      'registration_start',
      'registration_deadline',
      'min_rank',
      'max_rank',
      'eligible_ranks',
      'tournament_type',
      'contact_info',
      'banner_image',
      'created_at',
      'updated_at',
    ],
    required: ['id', 'name', 'start_date', 'end_date'],
  },
  challenges: {
    columns: [
      'id',
      'challenger_id',
      'challenged_id',
      'status',
      'bet_points',
      'proposed_datetime',
      'proposed_club_id',
      'confirmed_datetime',
      'confirmed_club_id',
      'challenger_score',
      'challenged_score',
      'winner_id',
      'message',
      'created_at',
      'updated_at',
    ],
    required: ['id', 'challenger_id', 'challenged_id', 'bet_points'],
  },
  matches: {
    columns: [
      'id',
      'player1_id',
      'player2_id',
      'winner_id',
      'status',
      'score1',
      'score2',
      'match_date',
      'duration_minutes',
      'club_id',
      'table_number',
      'tournament_id',
      'challenge_id',
      'created_at',
      'updated_at',
    ],
    required: ['id', 'player1_id', 'player2_id', 'status'],
  },
  notifications: {
    columns: [
      'id',
      'user_id',
      'title',
      'message',
      'type',
      'priority',
      'read_at',
      'action_url',
      'metadata',
      'created_at',
      'updated_at',
    ],
    required: ['id', 'user_id', 'title', 'message'],
  },
  wallets: {
    columns: ['id', 'user_id', 'balance', 'status', 'created_at', 'updated_at'],
    required: ['id', 'user_id'],
  },
  wallet_transactions: {
    columns: [
      'id',
      'wallet_id',
      'transaction_type',
      'amount',
      'balance_before',
      'balance_after',
      'description',
      'status',
      'payment_method',
      'reference_id',
      'metadata',
      'created_at',
    ],
    required: ['id', 'wallet_id', 'transaction_type', 'amount'],
  },
  marketplace_items: {
    columns: [
      'id',
      'seller_id',
      'title',
      'description',
      'price',
      'original_price',
      'category',
      'condition',
      'brand',
      'model',
      'images',
      'location',
      'specifications',
      'status',
      'views_count',
      'favorites_count',
      'created_at',
      'updated_at',
    ],
    required: ['id', 'seller_id', 'title', 'price'],
  },
};

class DatabaseSchemaValidator {
  private results: SchemaValidationResult[] = [];

  private async getTableInfo(tableName: string): Promise<any> {
    try {
      // Mock table info since information_schema access is not available
      console.log(`Mock: Getting table info for ${tableName}`);
      return null;
    } catch (error) {
      console.error(`Error getting table info for ${tableName}:`, error);
      return null;
    }
  }

  private async getTablePolicies(tableName: string): Promise<string[]> {
    try {
      // Mock policies since information_schema access is not available
      console.log(`Mock: Getting policies for ${tableName}`);
      return [];
    } catch (error) {
      console.error(`Error getting policies for ${tableName}:`, error);
      return [];
    }
  }

  private async getTableIndexes(tableName: string): Promise<string[]> {
    try {
      // Mock indexes since information_schema access is not available
      console.log(`Mock: Getting indexes for ${tableName}`);
      return [];
    } catch (error) {
      console.error(`Error getting indexes for ${tableName}:`, error);
      return [];
    }
  }

  private async checkRLS(tableName: string): Promise<boolean> {
    try {
      // Mock RLS check since information_schema access is not available
      console.log(`Mock: Checking RLS for ${tableName}`);
      return false;
    } catch (error) {
      console.error(`Error checking RLS for ${tableName}:`, error);
      return false;
    }
  }

  async validateTable(tableName: string): Promise<SchemaValidationResult> {
    const result: SchemaValidationResult = {
      table: tableName,
      exists: false,
      columns: [],
      missingColumns: [],
      extraColumns: [],
      hasRLS: false,
      policies: [],
      indexes: [],
      errors: [],
    };

    try {
      // Check if table exists
      const tableInfo = await this.getTableInfo(tableName);
      if (!tableInfo) {
        result.errors.push('Table does not exist or cannot be accessed');
        return result;
      }

      result.exists = true;
      result.columns = (tableInfo as Array<{ column_name: string }>).map((col) => col.column_name);

      // Check RLS
      result.hasRLS = await this.checkRLS(tableName);

      // Get policies
      result.policies = await this.getTablePolicies(tableName);

      // Get indexes
      result.indexes = await this.getTableIndexes(tableName);

      // Validate against expected schema
      const expectedSchema =
        EXPECTED_SCHEMA[tableName as keyof typeof EXPECTED_SCHEMA];
      if (expectedSchema) {
        const expectedColumns = expectedSchema.columns;
        const actualColumns = result.columns;

        // Find missing columns
        result.missingColumns = expectedColumns.filter(
          col => !actualColumns.includes(col)
        );

        // Find extra columns
        result.extraColumns = actualColumns.filter(
          col => !expectedColumns.includes(col)
        );

        // Check required columns
        const missingRequired = expectedSchema.required.filter(
          col => !actualColumns.includes(col)
        );
        if (missingRequired.length > 0) {
          result.errors.push(
            `Missing required columns: ${missingRequired.join(', ')}`
          );
        }
      } else {
        result.errors.push('No expected schema defined for this table');
      }
    } catch (error: any) {
      result.errors.push(`Validation error: ${error.message}`);
    }

    return result;
  }

  async validateAllTables(): Promise<DatabaseSchemaReport> {
    this.results = [];

    const tableNames = Object.keys(EXPECTED_SCHEMA);
    const validationPromises = tableNames.map(tableName =>
      this.validateTable(tableName)
    );

    this.results = await Promise.all(validationPromises);

    const valid = this.results.filter(
      r => r.exists && r.errors.length === 0
    ).length;
    const invalid = this.results.filter(
      r => !r.exists || r.errors.length > 0
    ).length;
    const missingTables = this.results.filter(r => !r.exists).map(r => r.table);

    return {
      overall: invalid === 0,
      tables: this.results,
      summary: {
        total: this.results.length,
        valid,
        invalid,
        missingTables,
      },
    };
  }

  async validateSpecificTable(
    tableName: string
  ): Promise<SchemaValidationResult> {
    return this.validateTable(tableName);
  }

  getResults(): SchemaValidationResult[] {
    return this.results;
  }

  clearResults(): void {
    this.results = [];
  }
}

export const databaseSchemaValidator = new DatabaseSchemaValidator();

// Convenience function for quick validation
export const validateDatabaseSchema =
  async (): Promise<DatabaseSchemaReport> => {
    return databaseSchemaValidator.validateAllTables();
  };
