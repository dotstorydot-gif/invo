import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/customer.dart';
import '../models/sales_invoice.dart';

class SalesService {
  final SupabaseClient _client = Supabase.instance.client;

  Future<List<Customer>> fetchCustomers(String orgId) async {
    final response = await _client
        .from('customers')
        .select('*')
        .eq('organization_id', orgId)
        .order('name', ascending: true);

    return (response as List).map((item) => Customer.fromJson(item)).toList();
  }

  Future<List<SalesInvoice>> fetchInvoices(String orgId) async {
    final response = await _client
        .from('sales_invoices')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', ascending: false);

    return (response as List).map((item) => SalesInvoice.fromJson(item)).toList();
  }
}
