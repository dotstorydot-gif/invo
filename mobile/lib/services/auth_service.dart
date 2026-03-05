import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_session.dart';

class AuthService {
  final SupabaseClient _client = Supabase.instance.client;

  Future<UserSession> signIn({
    required String orgNameOrSubdomain,
    required String username,
    required String password,
    bool isEmployee = false,
  }) async {
    // 1. Find the organization
    final orgResponse = await _client
        .from('organizations')
        .select('id, name, subscription_plan, module_type')
        .or('name.ilike.%$orgNameOrSubdomain%,subdomain.ilike.%$orgNameOrSubdomain%')
        .limit(1)
        .maybeSingle();

    if (orgResponse == null) {
      throw Exception('Organization not found.');
    }

    final org = orgResponse;

    if (isEmployee) {
      // 2a. Find employee
      final staffResponse = await _client
          .from('staff')
          .select('id, organization_id, name, email')
          .eq('organization_id', org['id'])
          .eq('email', username)
          .limit(1)
          .maybeSingle();

      if (staffResponse == null) {
        throw Exception('Invalid employee credentials.');
      }

      // MVP: assuming password match for '123456' as per web logic
      if (password != '123456') {
        throw Exception('Invalid password.');
      }

      return UserSession(
        userId: staffResponse['id'],
        orgId: staffResponse['organization_id'],
        role: 'Employee',
        username: staffResponse['email'],
        fullName: staffResponse['name'],
        orgName: org['name'],
        moduleType: org['module_type'] ?? 'Real Estate',
        isEmployee: true,
      );
    } else {
      // 2b. Find admin
      final userResponse = await _client
          .from('users')
          .select('id, organization_id, username, password_hash, role, full_name, profile_picture')
          .eq('organization_id', org['id'])
          .eq('username', username)
          .limit(1)
          .maybeSingle();

      if (userResponse == null) {
        throw Exception('Invalid admin credentials.');
      }

      if (userResponse['password_hash'] != password) {
        throw Exception('Invalid password.');
      }

      return UserSession(
        userId: userResponse['id'],
        orgId: userResponse['organization_id'],
        role: userResponse['role'],
        username: userResponse['username'],
        fullName: userResponse['full_name'],
        orgName: org['name'],
        profilePicture: userResponse['profile_picture'],
        subscriptionPlan: org['subscription_plan'],
        moduleType: org['module_type'] ?? 'Real Estate',
        isEmployee: false,
      );
    }
  }

  Future<void> signOut() async {
    // In mobile, we just clear the local session since we use custom logic
    // but we can also call Supabase signOut if we were using their native auth
    await _client.auth.signOut();
  }

  User? get currentUser => _client.auth.currentUser;
  
  Stream<AuthState> get authStateChanges => _client.auth.onAuthStateChange;
}
