import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/transaction.dart';

class FinancialMetrics {
  final double totalExpenses;
  final int activeLoansCount;
  final double monthlyExpenseGrowth;

  FinancialMetrics({
    required this.totalExpenses,
    required this.activeLoansCount,
    required this.monthlyExpenseGrowth,
  });
}

class FinancialService {
  final SupabaseClient _client = Supabase.instance.client;

  Future<List<Transaction>> getTransactions(String orgId) async {
    final response = await _client
        .from('expenses')
        .select()
        .eq('organization_id', orgId)
        .order('date', ascending: false);
    
    return (response as List).map((item) => Transaction.fromMap(item)).toList();
  }

  Future<FinancialMetrics> getSummaryMetrics(String orgId) async {
    // 1. Total Expenses
    final expensesResponse = await _client
        .from('expenses')
        .select('amount')
        .eq('organization_id', orgId);
    
    double total = 0;
    for (var row in expensesResponse) {
      total += (row['amount'] ?? 0).toDouble();
    }

    // 2. Active Loans Count
    final loansResponse = await _client
        .from('loans')
        .select('id', const FetchOptions(count: CountOption.exact))
        .eq('organization_id', orgId)
        .eq('status', 'Active');
    
    int loansCount = loansResponse.length;

    // 3. Simple calc for "Month" growth (placeholder for now, could be improved)
    double growth = 12000; // Placeholder until we have more time-series data

    return FinancialMetrics(
      totalExpenses: total,
      activeLoansCount: loansCount,
      monthlyExpenseGrowth: growth,
    );
  }
}
