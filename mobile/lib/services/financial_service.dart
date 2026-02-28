import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/transaction.dart';

class FinancialService {
  final SupabaseClient _client = Supabase.instance.client;

  Future<List<Transaction>> getTransactions() async {
    // Assuming transactions are stored in an 'expenses' or 'cash_flow' table
    // For now, let's use 'expenses'
    final response = await _client
        .from('expenses')
        .select()
        .order('created_at', ascending: false);
    
    return (response as List).map((item) => Transaction.fromMap(item)).toList();
  }
}
