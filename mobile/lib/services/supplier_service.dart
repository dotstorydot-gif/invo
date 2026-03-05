import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/supplier.dart';

class SupplierService {
  final SupabaseClient _client = Supabase.instance.client;

  Future<List<Supplier>> fetchSuppliers(String orgId) async {
    final response = await _client
        .from('suppliers')
        .select('*')
        .eq('organization_id', orgId)
        .order('company_name', ascending: true);

    return (response as List).map((item) => Supplier.fromJson(item)).toList();
  }
}
