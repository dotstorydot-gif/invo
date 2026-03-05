import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_session.dart';

class SessionProvider extends ChangeNotifier {
  UserSession? _session;
  static const String _sessionKey = 'invoica_user_session';

  UserSession? get session => _session;
  bool get isAuthenticated => _session != null;

  SessionProvider() {
    _loadSession();
  }

  Future<void> _loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    final sessionStr = prefs.getString(_sessionKey);
    if (sessionStr != null) {
      try {
        _session = UserSession.fromJson(jsonDecode(sessionStr));
        notifyListeners();
      } catch (e) {
        debugPrint('Error loading session: $e');
      }
    }
  }

  Future<void> setSession(UserSession session) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_sessionKey, jsonEncode(session.toJson()));
    _session = session;
    notifyListeners();
  }

  Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_sessionKey);
    _session = null;
    notifyListeners();
  }
}
