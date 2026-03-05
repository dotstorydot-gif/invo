import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/unit.dart';

class UnitsService {
  final SupabaseClient _client = Supabase.instance.client;

  Future<List<Unit>> fetchUnits(String orgId) async {
    final response = await _client
        .from('units')
        .select('*')
        .eq('organization_id', orgId)
        .order('name', ascending: true);

    return (response as List).map((item) => Unit.fromJson(item)).toList();
  }
}
