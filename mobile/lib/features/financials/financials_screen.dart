import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../services/financial_service.dart';
import '../../models/transaction.dart';
import '../../widgets/app_drawer.dart';
import '../../core/session_provider.dart';

class FinancialsScreen extends StatefulWidget {
  const FinancialsScreen({super.key});

  @override
  State<FinancialsScreen> createState() => _FinancialsScreenState();
}

class _FinancialsScreenState extends State<FinancialsScreen> {
  final _financialService = FinancialService();
  bool _isLoading = true;
  List<Transaction> _transactions = [];
  FinancialMetrics? _metrics;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final session = context.read<SessionProvider>().session;
    if (session == null) return;

    setState(() => _isLoading = true);
    try {
      final transactions = await _financialService.getTransactions(session.orgId);
      final metrics = await _financialService.getSummaryMetrics(session.orgId);
      setState(() {
        _transactions = transactions;
        _metrics = metrics;
      });
    } catch (e) {
      debugPrint('Error loading financials: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const AppDrawer(),
      appBar: AppBar(
        title: const Text('FINANCIALS'),
      ),
      body: _isLoading && _metrics == null
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFFFD700)))
          : Column(
              children: [
                _buildSummarySection(),
                Expanded(
                  child: RefreshIndicator(
                    onRefresh: _loadData,
                    color: const Color(0xFFFFD700),
                    child: _transactions.isEmpty
                        ? const Center(child: Text('No transactions found', style: TextStyle(color: Colors.white24)))
                        : ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: _transactions.length,
                            itemBuilder: (context, index) {
                              return _buildTransactionCard(_transactions[index]);
                            },
                          ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildSummarySection() {
    final currencyFormat = NumberFormat.currency(symbol: 'EGP ', decimalDigits: 0);
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Color(0xFF141414),
        border: Border(bottom: BorderSide(color: Colors.white10)),
      ),
      child: Column(
        children: [
          const Text(
            'Total Expenses',
            style: TextStyle(color: Colors.white38, fontSize: 14),
          ),
          const SizedBox(height: 8),
          Text(
            currencyFormat.format(_metrics?.totalExpenses ?? 0),
            style: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.w900,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildSimpleMetric('This Month', '+${currencyFormat.format(_metrics?.monthlyExpenseGrowth ?? 0)}', Colors.greenAccent),
              const SizedBox(width: 1, height: 20, child: ColoredBox(color: Colors.white10)),
              _buildSimpleMetric('Active Loans', '${_metrics?.activeLoansCount ?? 0}', Colors.blueAccent),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSimpleMetric(String label, String value, Color color) {
    return Column(
      children: [
        Text(value, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 16)),
        Text(label, style: const TextStyle(color: Colors.white38, fontSize: 10)),
      ],
    );
  }

  Widget _buildTransactionCard(Transaction tx) {
    // Determine type (Web app uses categories like 'Salaries', 'Supplies', etc)
    // For now simple red/green logic
    final bool isExpense = tx.amount > 0; // In this context often transactions are expenses
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF141414),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: (isExpense ? Colors.redAccent : Colors.greenAccent).withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isExpense ? LucideIcons.arrowUpRight : LucideIcons.arrowDownLeft,
              color: isExpense ? Colors.redAccent : Colors.greenAccent,
              size: 20,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tx.category,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                Text(
                  tx.description ?? 'No description',
                  style: TextStyle(color: Colors.white38, fontSize: 12),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${isExpense ? '-' : '+'} EGP ${tx.amount.toStringAsFixed(0)}',
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  color: isExpense ? Colors.white : Colors.greenAccent,
                  fontSize: 14,
                ),
              ),
              Text(
                tx.date.toString().split(' ')[0],
                style: const TextStyle(color: Colors.white12, fontSize: 10),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
