import 'package:flutter/material.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'app_translation.dart';

class LocaleProvider extends ChangeNotifier {
  final FlutterLocalization _localization = FlutterLocalization.instance;

  LocaleProvider();

  List<LocalizationsDelegate<dynamic>> get delegates => _localization.localizationsDelegates.toList();
  List<Locale> get supportedLocales => _localization.supportedLocales.toList();
  String get currentLanguage => _localization.currentLocale?.languageCode ?? 'en';

  void setLanguage(String languageCode) {
    _localization.translate(languageCode);
    notifyListeners();
  }

  void toggleLanguage() {
    if (currentLanguage == 'en') {
      setLanguage('ar');
    } else {
      setLanguage('en');
    }
  }
}
