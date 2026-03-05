import 'package:supabase_flutter/supabase_flutter.dart';

class DashboardMetrics {
  final double totalRevenue;
  final int activeUnits;
  final int totalCustomers;
  final double totalActiveLoans;
  final List<Map<String, dynamic>> recentActivity;

  DashboardMetrics({
    required this.totalRevenue,
    required this.activeUnits,
    required this.totalCustomers,
    required this.totalActiveLoans,
    required this.recentActivity,
  });
}

class DashboardService {
  final SupabaseClient _client = Supabase.instance.client;

  Future<DashboardMetrics> fetchMetrics(String orgId) async {
    try {
      // 1. Fetch Sales Invoices for Revenue
      final salesResponse = await _client
          .from('sales_invoices')
          .select('amount')
          .eq('organization_id', orgId);
      
      final stashResponse = await _client
          .from('stash_transactions')
          .select('amount')
          .eq('organization_id', orgId)
          .eq('type', 'In');

      double revenue = 0;
      for (var row in salesResponse) {
        revenue += (row['amount'] ?? 0).toDouble();
      }
      for (var row in stashResponse) {
        revenue += (row['amount'] ?? 0).toDouble();
      }

      // 2. Fetch Units
      final unitsResponse = await _client
          .from('units')
          .select('id, status')
          .eq('organization_id', orgId);
      
      int activeUnits = unitsResponse.where((u) => u['status'] == 'Available').length;

      // 3. Fetch Customers
      final customersResponse = await _client
          .from('customers')
          .select('id')
          .eq('organization_id', orgId);
      
      int customerCount = (customersResponse as List).length;

      // 4. Fetch Loans
      final loansResponse = await _client
          .from('loans')
          .select('principal_amount, amount_paid, status')
          .eq('organization_id', orgId)
          .eq('status', 'Active');
      
      double activeLoans = 0;
      for (var l in loansResponse) {
        activeLoans += (l['principal_amount'] ?? 0).toDouble() - (l['amount_paid'] ?? 0).toDouble();
      }

      // 5. Build Aggregated Recent Activity
      List<Map<String, dynamic>> activity = [];
      
      // Services
      final servicesRes = await _client.from('services').select('name, created_at').eq('organization_id', orgId).order('created_at', ascending: false).limit(2);
      for (var s in servicesRes) activity.add({'label': 'Service listed', 'target': s['name'], 'time': s['created_at']});

      // Staff
      final staffRes = await _client.from('staff').select('full_name, name, created_at').eq('organization_id', orgId).order('created_at', ascending: false).limit(2);
      for (var st in staffRes) activity.add({'label': 'Team member added', 'target': st['full_name'] ?? st['name'], 'time': st['created_at']});

      // Invoices
      final invRes = await _client.from('sales_invoices').select('id, amount, created_at').eq('organization_id', orgId).order('created_at', ascending: false).limit(2);
      for (var inv in invRes) activity.add({'label': 'Invoice generated', 'target': 'EGP ${inv['amount']}', 'time': inv['created_at']});

      // Inventory
      final invItemsRes = await _client.from('inventory').select('name, created_at').eq('organization_id', orgId).order('created_at', ascending: false).limit(2);
      for (var item in invItemsRes) activity.add({'label': 'Stock update', 'target': item['name'], 'time': item['created_at']});

      // Sort activity by time
      activity.sort((a, b) => b['time'].compareTo(a['time']));

      return DashboardMetrics(
        totalRevenue: revenue,
        activeUnits: activeUnits,
        totalCustomers: customerCount,
        totalActiveLoans: activeLoans,
        recentActivity: activity.take(8).toList(),
      );
    } catch (e) {
      print('Dashboard Fetch Error: $e');
      rethrow;
    }
  }
}
