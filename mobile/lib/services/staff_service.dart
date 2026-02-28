import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/staff_member.dart';

class StaffService {
  final SupabaseClient _client = Supabase.instance.client;

  Future<List<StaffMember>> getStaff() async {
    final response = await _client
        .from('staff')
        .select()
        .order('name', ascending: true);
    
    return (response as List).map((item) => StaffMember.fromMap(item)).toList();
  }
}
