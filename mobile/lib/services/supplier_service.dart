import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/supplier.dart';

class SupplierService {
  final SupabaseClient _client = Supabase.instance.client;

  Future<List<Supplier>> getSuppliers() async {
    // Note: Table name might be 'suppliers'
    final response = await _client
        .from('suppliers')
        .select()
        .order('company_name', ascending: true);
    
    return (response as List).map((item) => Supplier.fromMap(item)).toList();
  }
}
