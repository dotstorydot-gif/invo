import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../services/staff_service.dart';
import '../../models/staff_member.dart';
import '../../widgets/app_drawer.dart';
import '../../core/session_provider.dart';

class StaffScreen extends StatefulWidget {
  const StaffScreen({super.key});

  @override
  State<StaffScreen> createState() => _StaffScreenState();
}

class _StaffScreenState extends State<StaffScreen> {
  final _staffService = StaffService();
  bool _isLoading = true;
  List<StaffMember> _allStaff = [];
  List<StaffMember> _filteredStaff = [];
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadStaff();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      _filteredStaff = _allStaff.where((s) {
        return s.name.toLowerCase().contains(query) || 
               (s.role?.toLowerCase().contains(query) ?? false);
      }).toList();
    });
  }

  Future<void> _loadStaff() async {
    final session = context.read<SessionProvider>().session;
    if (session == null) return;

    try {
      final staff = await _staffService.fetchStaff(session.orgId);
      setState(() {
        _allStaff = staff;
        _filteredStaff = staff;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const AppDrawer(),
      appBar: AppBar(
        title: const Text('TEAM MEMBERS'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.plus, size: 20),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: const Color(0xFF141414),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.05)),
              ),
              child: TextField(
                controller: _searchController,
                style: const TextStyle(fontSize: 14),
                decoration: const InputDecoration(
                  icon: Icon(LucideIcons.search, size: 18, color: Colors.white24),
                  hintText: 'Search team members...',
                  hintStyle: TextStyle(color: Colors.white24),
                  border: InputBorder.none,
                ),
              ),
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFFFFD700)))
                : RefreshIndicator(
                    onRefresh: _loadStaff,
                    color: const Color(0xFFFFD700),
                    child: _filteredStaff.isEmpty
                        ? const Center(child: Text('No members found', style: TextStyle(color: Colors.white24)))
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: _filteredStaff.length,
                            itemBuilder: (context, index) {
                              final member = _filteredStaff[index];
                              return _buildStaffCard(member);
                            },
                          ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildStaffCard(StaffMember member) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF141414),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFFFD700).withOpacity(0.2)),
            ),
            child: CircleAvatar(
              radius: 24,
              backgroundColor: const Color(0xFF1A1A1A),
              backgroundImage: member.avatarUrl != null ? NetworkImage(member.avatarUrl!) : null,
              child: member.avatarUrl == null
                  ? const Icon(LucideIcons.user, color: Colors.white24, size: 20)
                  : null,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  member.name,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                Text(
                  member.role ?? 'Member',
                  style: const TextStyle(color: Colors.white38, fontSize: 12),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                'EGP ${member.salary.toStringAsFixed(0)}',
                style: const TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 14,
                  color: Color(0xFFFFD700),
                ),
              ),
              const Icon(LucideIcons.chevronRight, size: 16, color: Colors.white12),
            ],
          ),
        ],
      ),
    );
  }
}
