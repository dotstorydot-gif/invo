import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/inventory_item.dart';

class InventoryService {
  final SupabaseClient _client = Supabase.instance.client;

  Future<List<InventoryItem>> fetchInventory(String orgId) async {
    final response = await _client
        .from('inventory')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', ascending: false);
    
    return (response as List).map((item) => InventoryItem.fromMap(item)).toList();
  }

  Future<void> addItem(Map<String, dynamic> item) async {
    await _client.from('inventory').insert(item);
  }
}
