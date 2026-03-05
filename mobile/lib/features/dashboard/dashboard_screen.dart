import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../core/session_provider.dart';
import '../../services/dashboard_service.dart';
import '../../widgets/app_drawer.dart';
import 'package:intl/intl.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final DashboardService _dashboardService = DashboardService();
  DashboardMetrics? _metrics;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadMetrics();
  }

  Future<void> _loadMetrics() async {
    final session = context.read<SessionProvider>().session;
    if (session == null) return;

    setState(() => _isLoading = true);
    try {
      final metrics = await _dashboardService.fetchMetrics(session.orgId);
      setState(() => _metrics = metrics);
    } catch (e) {
      debugPrint('Error loading dashboard: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SessionProvider>().session;
    final isMarketing = session?.moduleType == 'Service & Marketing';

    return Scaffold(
      drawer: const AppDrawer(),
      appBar: AppBar(
        title: const Text(
          'DASHBOARD',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w800,
            letterSpacing: 2,
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(LucideIcons.bell, size: 20),
            onPressed: () {},
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadMetrics,
        color: const Color(0xFFFFD700),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Welcome, ${session?.fullName ?? "User"}',
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Performance Overview',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 24),
              if (_isLoading && _metrics == null)
                const Center(child: CircularProgressIndicator(color: Color(0xFFFFD700)))
              else ...[
                Row(
                  children: [
                    Expanded(
                      child: _buildMetricCard(
                        title: 'Total Revenue',
                        value: '${NumberFormat.compact().format(_metrics?.totalRevenue ?? 0)} EGP',
                        icon: LucideIcons.chartLine,
                        color: Colors.greenAccent,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildMetricCard(
                        title: isMarketing ? 'Services' : 'Active Units',
                        value: '${_metrics?.activeUnits ?? 0}',
                        icon: isMarketing ? LucideIcons.briefcase : LucideIcons.house,
                        color: Colors.blueAccent,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: _buildMetricCard(
                        title: isMarketing ? 'Clients' : 'Customers',
                        value: '${_metrics?.totalCustomers ?? 0}',
                        icon: LucideIcons.users,
                        color: Colors.purpleAccent,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildMetricCard(
                        title: 'Active Loans',
                        value: '${NumberFormat.compact().format(_metrics?.totalActiveLoans ?? 0)} EGP',
                        icon: LucideIcons.compass,
                        color: Colors.redAccent,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),
                const Text(
                  'Recent Activity',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                if (_metrics?.recentActivity.isEmpty ?? true)
                  const Center(child: Padding(
                    padding: EdgeInsets.all(40.0),
                    child: Text('No recent activity', style: TextStyle(color: Colors.white24)),
                  ))
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _metrics?.recentActivity.length ?? 0,
                    separatorBuilder: (context, index) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final item = _metrics!.recentActivity[index];
                      return _buildActivityItem(
                        label: item['label'],
                        target: item['target'],
                        time: item['time'],
                      );
                    },
                  ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF141414),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 20),
          Text(
            value,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: TextStyle(
              color: Colors.white.withOpacity(0.4),
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActivityItem({required String label, required String target, required String time}) {
    DateTime? dateTime = DateTime.tryParse(time);
    String displayTime = dateTime != null ? DateFormat.yMMMd().format(dateTime) : time;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF141414),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              shape: BoxShape.circle,
            ),
            child: Icon(LucideIcons.user, size: 18, color: Colors.white38),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                ),
                const SizedBox(height: 2),
                Text(
                  'Target: $target',
                  style: TextStyle(color: const Color(0xFFFFD700).withOpacity(0.7), fontSize: 12),
                ),
              ],
            ),
          ),
          Text(
            displayTime,
            style: TextStyle(color: Colors.white.withOpacity(0.2), fontSize: 10),
          ),
        ],
      ),
    );
  }
}
