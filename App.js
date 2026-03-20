import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Switch, SafeAreaView, Modal,
  ActivityIndicator, Pressable, Image, Linking,
} from 'react-native';

const fontSettings = {
  fontFamily: Platform.OS === 'ios' ? 'Hiragino Sans Round' : 'sans-serif-medium',
  letterSpacing: 0.5,
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 53 }, (_, i) => (currentYear - 18 - i).toString());
const ages = Array.from({ length: 43 }, (_, i) => (18 + i).toString());

const industryOptions = ['飲食・接客', '営業・販売', '事務・オフィスワーク', '建設・現場系', '運送・ドライバー', 'IT・クリエイティブ', '美容・エステ', '医療・福祉', 'ナイトワーク関連', 'その他'];

// --- 共通コンポーネント ---
const Section = ({ title, description, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {description && <Text style={styles.sectionDescription}>{description}</Text>}
    {children}
  </View>
);

const InputField = ({ label, placeholder, multiline = false, flex = 1, keyboardType = 'default', value, onChangeText, error = false, required = false }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={[styles.inputContainer, { flex }]}>
      <View style={styles.labelRow}><Text style={styles.label}>{label}</Text>{required && <Text style={styles.requiredTag}>必須</Text>}</View>
      <TextInput
        style={[styles.input, multiline && styles.textArea, error && { borderColor: '#FF3B30', borderWidth: 2 }, isFocused && { borderColor: '#FF77A9', borderWidth: 2 }]}
        placeholder={placeholder} placeholderTextColor="#FFC1D6" multiline={multiline} keyboardType={keyboardType} value={value} onChangeText={onChangeText} selectionColor="#FF77A9" onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
      />
      {error && <Text style={styles.errorText}>入力してください</Text>}
    </View>
  );
};

const DropdownSelector = ({ label, options, selectedValue, onSelect, error, required, flex = 1, suffix = "", placeholder = "選択 ▼" }) => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View style={[styles.inputContainer, { flex }]}>
      <View style={styles.labelRow}><Text style={styles.label}>{label}</Text>{required && <Text style={styles.requiredTag}>必須</Text>}</View>
      <TouchableOpacity style={[styles.dropdownTrigger, error && { borderColor: '#FF3B30', borderWidth: 2 }]} onPress={() => setModalVisible(true)}>
        <Text style={[styles.dropdownText, !selectedValue && { color: '#FFC1D6' }]}>{selectedValue ? `${selectedValue}${suffix}` : placeholder}</Text>
      </TouchableOpacity>
      <Modal transparent={true} visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>{label}を選択</Text></View>
            <ScrollView style={{ maxHeight: 400 }}>
              {options.map((item) => (
                <TouchableOpacity key={item.toString()} style={[styles.modalItem, selectedValue === item.toString() && { backgroundColor: '#FFF0F5' }]} onPress={() => { onSelect(item.toString()); setModalVisible(false); }}>
                  <Text style={[styles.modalItemText, selectedValue === item.toString() && { color: '#FF77A9', fontWeight: 'bold' }]}>{item}{suffix}</Text>
                  {selectedValue === item.toString() && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const SelectButtons = ({ label, options, selectedValue, onSelect, error, required }) => (
  <View style={styles.inputContainer}>
    <View style={styles.labelRow}><Text style={styles.label}>{label}</Text>{required && <Text style={styles.requiredTag}>必須</Text>}</View>
    <View style={[styles.buttonRow, error && { borderWidth: 2, borderColor: '#FF3B30', borderRadius: 8, padding: 2 }]}>
      {options.map((opt) => (
        <TouchableOpacity key={opt} style={[styles.selectBtn, selectedValue === opt && styles.selectBtnActive]} onPress={() => onSelect(opt)}>
          <Text style={[styles.selectBtnText, selectedValue === opt && styles.selectBtnTextActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
    {error && <Text style={styles.errorText}>選択してください</Text>}
  </View>
);

const MultiSelectButtons = ({ label, options, selectedValues, onToggle, error, required }) => (
  <View style={styles.inputContainer}>
    <View style={styles.labelRow}><Text style={styles.label}>{label}</Text>{required && <Text style={styles.requiredTag}>必須</Text>}</View>
    <View style={[styles.buttonRow, error && { borderWidth: 2, borderColor: '#FF3B30', borderRadius: 8, padding: 2 }]}>
      {options.map((opt) => (
        <TouchableOpacity key={opt} style={[styles.selectBtn, selectedValues.includes(opt) && styles.selectBtnActive]} onPress={() => onToggle(opt)}>
          <Text style={[styles.selectBtnText, selectedValues.includes(opt) && styles.selectBtnTextActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
    {error && <Text style={styles.errorText}>選択してください</Text>}
  </View>
);

const WorkHistoryCard = ({ symbol, prefix, data, updateField }) => (
  <View style={styles.historyCard}>
    <Text style={styles.historyLabel}>夜職歴 {symbol}</Text>
    <InputField label="店舗名" placeholder="例：Club ABC" value={data[`${prefix}Name`]} onChangeText={(v) => updateField(`${prefix}Name`, v)} />
    <View style={styles.row}>
      <InputField label="時給" placeholder="例：5000" flex={1} keyboardType="numeric" value={data[`${prefix}Wage`]} onChangeText={(v) => updateField(`${prefix}Wage`, v)} />
      <View style={{ width: 10 }} />
      <InputField label="月平均売上" placeholder="例：150万" flex={1} value={data[`${prefix}Sales`]} onChangeText={(v) => updateField(`${prefix}Sales`, v)} />
    </View>
    <View style={styles.row}>
      <InputField label="期間" placeholder="例：1年" flex={1} value={data[`${prefix}Period`]} onChangeText={(v) => updateField(`${prefix}Period`, v)} />
      <View style={{ width: 10 }} />
      <InputField label="退職日" placeholder="例：2024/01" flex={1} value={data[`${prefix}QuitDate`]} onChangeText={(v) => updateField(`${prefix}QuitDate`, v)} />
    </View>
    <InputField label="退職理由" multiline placeholder="例：移転のため" value={data[`${prefix}QuitReason`]} onChangeText={(v) => updateField(`${prefix}QuitReason`, v)} />
  </View>
);

export default function App() {
  const [isAgreed, setIsAgreed] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // --- キーを統一した初期ステート ---
  const [form, setForm] = useState({
    name: '', kana: '', stageName: '', birthY: '', birthM: '', birthD: '', age: '', zodiac: '', bloodType: '',
    height: '', weight: '', cup: '', b: '', w: '', h: '', phone: '', address: '', domicileStatus: '', domicileCustom: '',
    livingStatus: '', livingStatusCustom: '', jobDay: '', jobNight: '', language: [], languageCustom: '',
    applyMethod: '', introducer: '', applyMethodCustom: '', motivationStatus: [], motivationCustom: '', desiredWage: '',
    daysPerWeek: '', availableDays: [], nightJobExp: '', alcohol: '', transport: '', transportCustom: '',
    hobby: '', skill: '', qualifications: '', salesTarget: '', shopConditions: '',
    rental: [], shooting: '', shootingDetail: [], birthdayWill: '', accompaniment: '', accompanimentCustom: '',
    deliveryTrialStatus: '', deliveryTrialCustom: '', deliveryPostStatus: '', deliveryPostCustom: '',
    trialWorkTimeStatus: '', trialWorkTimeCustom: '', postWorkTimeStatus: '', postWorkTimeCustom: '',
    familyStatus: [], childrenDetail: '', familyApproval: '', illness: '', illnessDetail: '', debt: '', debtDetail: '',
    tattoo: '', tattooDetail: '', 
    emName: '', emRelationStatus: '', emRelationCustom: '', emPhone: '', emAddressStatus: '', emAddressCustom: '',
    currentJobName: '', currentJobIndustry: '', currentJobWage: '', currentJobPeriod: '',
    instaID: '', instaFollowers: '', xID: '', xFollowers: '', tiktokID: '', tiktokFollowers: '',
    n1Name: '', n1Wage: '', n1Sales: '', n1Period: '', n1QuitDate: '', n1QuitReason: '',
    n2Name: '', n2Wage: '', n2Sales: '', n2Period: '', n2QuitDate: '', n2QuitReason: '',
    n3Name: '', n3Wage: '', n3Sales: '', n3Period: '', n3QuitDate: '', n3QuitReason: '',
    n4Name: '', n4Wage: '', n4Sales: '', n4Period: '', n4QuitDate: '', n4QuitReason: '',
    n5Name: '', n5Wage: '', n5Sales: '', n5Period: '', n5QuitDate: '', n5QuitReason: ''
  });

  const [errors, setErrors] = useState({});

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setIsSent(false);
    if (value && value.toString().trim() !== '') { setErrors(prev => ({ ...prev, [key]: false })); }
    setSubmitError("");
  };

  const toggleMulti = (key, val) => {
    let list = [...form[key]];
    if (list.includes(val)) { list = list.filter(v => v !== val); } else { list.push(val); }
    updateField(key, list);
    if (list.length > 0) { setErrors(prev => ({ ...prev, [key]: false })); }
  };

  const handleClose = () => { Linking.openURL('https://www.nights.fun/aichi/A2301/A230101/warp/'); };

  const handleViewSubmit = async () => {
    setSubmitError(""); setIsSent(false);
    let newErrors = {};
    const requiredList = [
      'name', 'kana', 'birthY', 'birthM', 'birthD', 'age', 'zodiac', 'bloodType', 'phone', 'address', 'domicileStatus',
      'livingStatus', 'jobDay', 'applyMethod', 'daysPerWeek', 'availableDays', 'desiredWage', 'nightJobExp',
      'deliveryTrialStatus', 'deliveryPostStatus', 'motivationStatus', 'emName', 'emRelationStatus', 'emPhone', 'emAddressStatus', 'alcohol', 'trialWorkTimeStatus', 'postWorkTimeStatus'
    ];
    requiredList.forEach(key => {
      const val = form[key];
      if (!val || val.toString().trim() === '' || (Array.isArray(val) && val.length === 0)) { newErrors[key] = true; }
    });
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); setSubmitError("赤枠の項目を確認してください。"); return; }
    if (!isAgreed) { setSubmitError("同意チェックをオンにしてください。"); return; }

    setIsSubmitting(true);
  try {
      const GAS_URL = "https://script.google.com/macros/s/AKfycby9r8g7PSHGTb8mYpZ3B4hpfLj1gvg3LWXpZlCuHGBwPz6RZadB2jG8e28LmQ8PAcLpLA/exec";
      const searchParams = new URLSearchParams();
      Object.keys(form).forEach(key => {
        if (Array.isArray(form[key])) { searchParams.append(key, form[key].join(', ')); }
        else { searchParams.append(key, form[key]); }
      });
      searchParams.append('timestamp', new Date().toLocaleString('ja-JP'));
      searchParams.append('formType', 'cast');
      await fetch(GAS_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: searchParams.toString() });
      setIsSent(true);
    } catch (e) { setSubmitError("通信エラーが発生しました。"); } finally { setIsSubmitting(false); }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      {isSent ? (
        <View style={styles.successPage}>
          <Image source={require('./assets/LOGO.png')} style={styles.fullWidthLogo} resizeMode="contain" />
          <View style={styles.successTextContainer}>
            <Text style={styles.successTitle}>送信が完了しました</Text>
            <Text style={styles.successMessage}>面接フォームのご記入ありがとうございます。{"\n"}担当者をお待ちください。</Text>
          </View>
          <View style={styles.successButtonRow}>
            <TouchableOpacity style={[styles.backButton, { backgroundColor: '#888' }]} onPress={() => setIsSent(false)}><Text style={styles.backButtonText}>入力し直す</Text></TouchableOpacity>
            <View style={{ width: 15 }} />
            <TouchableOpacity style={styles.backButton} onPress={handleClose}><Text style={styles.backButtonText}>画面を閉じる</Text></TouchableOpacity>
          </View>
        </View>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.header}><Text style={styles.headerTitle}>【キャスト用面接フォーム】</Text></View>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Section title="基本プロフィール">
              <InputField label="お名前" placeholder="例：山田 花子" required value={form.name} onChangeText={(v) => updateField('name', v)} error={errors.name} />
              <InputField label="かな" placeholder="例：やまだ はなこ" required value={form.kana} onChangeText={(v) => updateField('kana', v)} error={errors.kana} />
              <InputField label="源氏名" placeholder="希望があれば" value={form.stageName} onChangeText={(v) => updateField('stageName', v)} />
              <View style={styles.labelRow}><Text style={styles.label}>生年月日</Text><Text style={styles.requiredTag}>必須</Text></View>
              <View style={styles.row}>
                <DropdownSelector label="年" options={years} selectedValue={form.birthY} onSelect={(v) => updateField('birthY', v)} flex={1} error={errors.birthY} />
                <DropdownSelector label="月" options={Array.from({ length: 12 }, (_, i) => (i + 1).toString())} selectedValue={form.birthM} onSelect={(v) => updateField('birthM', v)} flex={1} error={errors.birthM} />
                <DropdownSelector label="日" options={Array.from({ length: 31 }, (_, i) => (i + 1).toString())} selectedValue={form.birthD} onSelect={(v) => updateField('birthD', v)} flex={1} error={errors.birthD} />
              </View>
              <View style={styles.row}>
                <DropdownSelector label="年齢" options={ages} selectedValue={form.age} onSelect={(v) => updateField('age', v)} suffix="歳" required error={errors.age} />
                <DropdownSelector label="干支" options={['ねずみ', 'うし', 'とら', 'うさぎ', 'たつ', 'へび', 'うま', 'ひつじ', 'さる', 'とり', 'いぬ', 'いのしし']} selectedValue={form.zodiac} onSelect={(v) => updateField('zodiac', v)} required error={errors.zodiac} />
                <DropdownSelector label="血液型" options={['A', 'B', 'O', 'AB']} selectedValue={form.bloodType} onSelect={(v) => updateField('bloodType', v)} suffix="型" required error={errors.bloodType} />
              </View>
              <View style={styles.row}>
                <InputField label="身長(cm)" placeholder="160" keyboardType="numeric" value={form.height} onChangeText={(v) => updateField('height', v)} />
                <View style={{ width: 10 }} /><InputField label="体重(kg)" placeholder="45" keyboardType="numeric" value={form.weight} onChangeText={(v) => updateField('weight', v)} />
                <View style={{ width: 10 }} /><DropdownSelector label="カップ" options={['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']} selectedValue={form.cup} onSelect={(v) => updateField('cup', v)} suffix="カップ" />
              </View>
              <View style={styles.labelRow}><Text style={styles.label}>B / W / H (各cm)</Text></View>
              <View style={styles.row}>
                <InputField label="B" placeholder="80" keyboardType="numeric" value={form.b} onChangeText={(v) => updateField('b', v)} flex={1} />
                <View style={{ width: 10 }} /><InputField label="W" placeholder="60" keyboardType="numeric" value={form.w} onChangeText={(v) => updateField('w', v)} flex={1} />
                <View style={{ width: 10 }} /><InputField label="H" placeholder="85" keyboardType="numeric" value={form.h} onChangeText={(v) => updateField('h', v)} flex={1} />
              </View>
              <InputField label="携帯番号" placeholder="09012345678" keyboardType="phone-pad" required value={form.phone} onChangeText={(v) => updateField('phone', v)} error={errors.phone} />
              <InputField label="現住所" multiline placeholder="愛知県名古屋市..." required value={form.address} onChangeText={(v) => updateField('address', v)} error={errors.address} />
              <SelectButtons label="本籍地" options={['現住所と同じ', 'その他']} required selectedValue={form.domicileStatus} onSelect={(v) => updateField('domicileStatus', v)} error={errors.domicileStatus} />
              {form.domicileStatus === 'その他' && <InputField label="本籍地詳細" placeholder="都道府県から" required value={form.domicileCustom} onChangeText={(v) => updateField('domicileCustom', v)} error={errors.domicileCustom} />}
              <SelectButtons label="お住まい状況" options={['実家', '一人暮らし', '友人宅', '彼氏と同居', 'その他']} required selectedValue={form.livingStatus} onSelect={(v) => updateField('livingStatus', v)} error={errors.livingStatus} />
              {form.livingStatus === 'その他' && <InputField label="詳細" placeholder="例：寮など" required value={form.livingStatusCustom} onChangeText={(v) => updateField('livingStatusCustom', v)} error={errors.livingStatusCustom} />}
            </Section>
            <Section title="緊急連絡先">
              <InputField label="ご氏名" required value={form.emName} onChangeText={(v) => updateField('emName', v)} error={errors.emName} />
              <SelectButtons label="続柄" options={['父', '母', '兄', '弟', '姉', '祖父母', 'その他']} required selectedValue={form.emRelationStatus} onSelect={(v) => updateField('emRelationStatus', v)} error={errors.emRelationStatus} />
              {form.emRelationStatus === 'その他' && <InputField label="具体的な続柄" required value={form.emRelationCustom} onChangeText={(v) => updateField('emRelationCustom', v)} error={errors.emRelationCustom} />}
              <InputField label="電話番号" required keyboardType="phone-pad" value={form.emPhone} onChangeText={(v) => updateField('emPhone', v)} error={errors.emPhone} />
              <SelectButtons label="住所" options={['現住所と同じ', 'その他']} required selectedValue={form.emAddressStatus} onSelect={(v) => updateField('emAddressStatus', v)} error={errors.emAddressStatus} />
              {form.emAddressStatus === 'その他' && <InputField label="住所詳細" multiline required value={form.emAddressCustom} onChangeText={(v) => updateField('emAddressCustom', v)} error={errors.emAddressCustom} />}
            </Section>
            <Section title="SNS情報">
              <View style={styles.dynamicSubSection}>
                <Text style={styles.subSectionTitle}>▼フォロワー数の多いアカウントがあれば是非ご記入ください！</Text>
                <View style={styles.row}>
                  <InputField label="Instagram ID" placeholder="@id" value={form.instaID} onChangeText={(v) => updateField('instaID', v)} />
                  <View style={{ width: 8 }} /><InputField label="フォロワー数" placeholder="例: 1000" keyboardType="numeric" value={form.instaFollowers} onChangeText={(v) => updateField('instaFollowers', v)} />
                </View>
                <View style={styles.row}>
                  <InputField label="X ID" placeholder="@id" value={form.xID} onChangeText={(v) => updateField('xID', v)} />
                  <View style={{ width: 8 }} /><InputField label="フォロワー数" placeholder="例: 500" keyboardType="numeric" value={form.xFollowers} onChangeText={(v) => updateField('xFollowers', v)} />
                </View>
                <View style={styles.row}>
                  <InputField label="TikTok ID" placeholder="@id" value={form.tiktokID} onChangeText={(v) => updateField('tiktokID', v)} />
                  <View style={{ width: 8 }} /><InputField label="フォロワー数" placeholder="例: 2000" keyboardType="numeric" value={form.tiktokFollowers} onChangeText={(v) => updateField('tiktokFollowers', v)} />
                </View>
              </View>
            </Section>
            <Section title="勤務条件・希望">
              <SelectButtons label="応募方法" options={['紹介', 'WARPスタッフの紹介', '求人広告', 'その他']} required selectedValue={form.applyMethod} onSelect={(v) => updateField('applyMethod', v)} error={errors.applyMethod} />
              {['紹介', 'WARPスタッフの紹介'].includes(form.applyMethod) && <InputField label="紹介者名" required value={form.introducer} onChangeText={(v) => updateField('introducer', v)} error={errors.introducer} />}
              {form.applyMethod === 'その他' && <InputField label="詳細" required value={form.applyMethodCustom} onChangeText={(v) => updateField('applyMethodCustom', v)} error={errors.applyMethodCustom} />}
              <SelectButtons label="週何回入れますか" options={['未定', '5-6日', '3-4日', '1-2日', '0-1日']} required selectedValue={form.daysPerWeek} onSelect={(v) => updateField('daysPerWeek', v)} error={errors.daysPerWeek} />
              <MultiSelectButtons label="何曜日入れますか" options={['未定', '月', '火', '水', '木', '金', '土']} required selectedValues={form.availableDays} onToggle={(v) => toggleMulti('availableDays', v)} error={errors.availableDays} />
              <DropdownSelector label="希望時給" options={['5000円', '6000円', '7000円', '8000円', '9000円', '10000円', '15000円以上']} selectedValue={form.desiredWage} onSelect={(v) => updateField('desiredWage', v)} required error={errors.desiredWage} />
              <MultiSelectButtons label="志望動機" options={['興味があった', 'お金を稼ぎたい', '自分磨き', 'その他']} required selectedValues={form.motivationStatus} onToggle={(v) => toggleMulti('motivationStatus', v)} error={errors.motivationStatus} />
{form.motivationStatus.some(item => ['その他','興味があった', 'お金を稼ぎたい', '自分磨き'].includes(item))&& <InputField label="志望動機の詳細" multiline value={form.motivationCustom} onChangeText={(v) => updateField('motivationCustom', v)} />}
            </Section>
            <Section title="時間・送り">
              <SelectButtons label="体験時時間" options={['LASTまで', '24時まで', '終電まで', 'その他']} required selectedValue={form.trialWorkTimeStatus} onSelect={(v) => updateField('trialWorkTimeStatus', v)} error={errors.trialWorkTimeStatus} />
              {form.trialWorkTimeStatus === 'その他' && <InputField label="詳細" value={form.trialWorkTimeCustom} onChangeText={(v) => updateField('trialWorkTimeCustom', v)} />}
              <SelectButtons label="入店後時間" options={['LASTまで', '24時まで', '終電まで', 'その他']} required selectedValue={form.postWorkTimeStatus} onSelect={(v) => updateField('postWorkTimeStatus', v)} error={errors.postWorkTimeStatus} />
              {form.postWorkTimeStatus === 'その他' && <InputField label="詳細" value={form.postWorkTimeCustom} onChangeText={(v) => updateField('postWorkTimeCustom', v)} />}
              <SelectButtons label="送り先エリア：体験時" options={['現住所と同じ', 'その他']} required selectedValue={form.deliveryTrialStatus} onSelect={(v) => updateField('deliveryTrialStatus', v)} error={errors.deliveryTrialStatus} />
              {form.deliveryTrialStatus === 'その他' && <InputField label="詳細" value={form.deliveryTrialCustom} onChangeText={(v) => updateField('deliveryTrialCustom', v)} />}
              <SelectButtons label="送り先エリア：入店後" options={['現住所と同じ', 'その他']} required selectedValue={form.deliveryPostStatus} onSelect={(v) => updateField('deliveryPostStatus', v)} error={errors.deliveryPostStatus} />
              {form.deliveryPostStatus === 'その他' && <InputField label="詳細" value={form.deliveryPostCustom} onChangeText={(v) => updateField('deliveryPostCustom', v)} />}
            </Section>
            <Section title="勤務情報">
             <SelectButtons 
    label="現在の職業" 
    options={['学生', 'フリーター/アルバイト', '会社員', '自営業', 'なし']} 
    required 
    selectedValue={form.jobDay} 
    onSelect={(v) => updateField('jobDay', v)} 
    error={errors.jobDay} 
  />

  {/* 修正ポイント：jobDayが入力されており、かつ「学生」「なし」以外の時のみ表示 */}
  {form.jobDay && !['学生', 'なし'].includes(form.jobDay) && (
    <View style={styles.dynamicSubSection}>
      <InputField 
        label="現在の会社/店名" 
        value={form.currentJobName} 
        onChangeText={(v) => updateField('currentJobName', v)} 
      />
      <SelectButtons 
        label="業種" 
        options={industryOptions} 
        selectedValue={form.currentJobIndustry} 
        onSelect={(v) => updateField('currentJobIndustry', v)} 
      />
      <InputField 
        label="月収/給与" 
        value={form.currentJobWage} 
        onChangeText={(v) => updateField('currentJobWage', v)} 
      />
      <InputField 
        label="在籍期間" 
        value={form.currentJobPeriod} 
        onChangeText={(v) => updateField('currentJobPeriod', v)} 
      />
    </View>
  )}
              <MultiSelectButtons label="語学" options={['日本語のみ', '英語', '中国語', 'その他']} selectedValues={form.language} onToggle={(v) => toggleMulti('language', v)} />
              {form.language.includes('その他') && <InputField label="具体的な語学" value={form.languageCustom} onChangeText={(v) => updateField('languageCustom', v)} />}
              <SelectButtons label="お酒" options={['強い', '飲める', '少し', 'NG']} required selectedValue={form.alcohol} onSelect={(v) => updateField('alcohol', v)} error={errors.alcohol} />
              <SelectButtons label="水商売の経験" options={['ある', 'ない']} required selectedValue={form.nightJobExp} onSelect={(v) => updateField('nightJobExp', v)} error={errors.nightJobExp} />
            </Section>
            {form.nightJobExp === 'ある' && (
              <Section title="過去の職歴 (夜職)">
                {[1, 2, 3, 4, 5].map(n => <WorkHistoryCard key={n} symbol={n} prefix={`n${n}`} data={form} updateField={updateField} />)}
              </Section>
            )}
            <Section title="詳細情報">
              <View style={styles.row}>
                <InputField label="趣味" value={form.hobby} onChangeText={(v) => updateField('hobby', v)} />
                <View style={{ width: 10 }} /><InputField label="特技" value={form.skill} onChangeText={(v) => updateField('skill', v)} />
              </View>
              <InputField label="保有資格" value={form.qualifications} onChangeText={(v) => updateField('qualifications', v)} />
              <InputField label="月売上目標" value={form.salesTarget} onChangeText={(v) => updateField('salesTarget', v)} />
              <InputField label="店への希望条件" multiline value={form.shopConditions} onChangeText={(v) => updateField('shopConditions', v)} />
              <MultiSelectButtons label="レンタル希望" options={['ドレス', 'ヒール', 'ハンカチ', 'ポーチ']} selectedValues={form.rental} onToggle={(v) => toggleMulti('rental', v)} />
              <SelectButtons label="撮影/掲載" options={['できる', 'できない']} selectedValue={form.shooting} onSelect={(v) => updateField('shooting', v)} />
              {form.shooting === 'できる' && <MultiSelectButtons label="掲載媒体" options={['ナイツ', '公式サイト', '看板']} selectedValues={form.shootingDetail} onToggle={(v) => toggleMulti('shootingDetail', v)} />}
              <SelectButtons label="バースデー" options={['する', 'しない']} selectedValue={form.birthdayWill} onSelect={(v) => updateField('birthdayWill', v)} />
              <SelectButtons label="同伴・アフター" options={['できる', 'できない']} selectedValue={form.accompaniment} onSelect={(v) => updateField('accompaniment', v)} />
              {form.accompaniment === 'できない' && <InputField label="できない理由" value={form.accompanimentCustom} onChangeText={(v) => updateField('accompanimentCustom', v)} />}
              <SelectButtons label="通勤手段" options={['車', '電車', '自転車', 'その他']} selectedValue={form.transport} onSelect={(v) => updateField('transport', v)} />
              {form.transport === 'その他' && <InputField label="詳細" value={form.transportCustom} onChangeText={(v) => updateField('transportCustom', v)} />}
              <SelectButtons label="借金" options={['ある', 'ない']} selectedValue={form.debt} onSelect={(v) => updateField('debt', v)} />
              {form.debt === 'ある' && <InputField label="いくらありますか" value={form.debtDetail} onChangeText={(v) => updateField('debtDetail', v)} />}
              <SelectButtons label="持病" options={['ある', 'ない']} selectedValue={form.illness} onSelect={(v) => updateField('illness', v)} />
              {form.illness === 'ある' && <InputField label="持病の内容" value={form.illnessDetail} onChangeText={(v) => updateField('illnessDetail', v)} />}
              <SelectButtons label="タトゥー" options={['ある', 'ない']} selectedValue={form.tattoo} onSelect={(v) => updateField('tattoo', v)} />
              {form.tattoo === 'ある' && <InputField label="部位・大きさ" value={form.tattooDetail} onChangeText={(v) => updateField('tattooDetail', v)} />}
              <MultiSelectButtons label="家族構成" options={['独身', '夫がいる', 'こどもがいる']} selectedValues={form.familyStatus} onToggle={(v) => toggleMulti('familyStatus', v)} />
              {form.familyStatus.includes('こどもがいる') && <InputField label="お子様の人数・年齢" value={form.childrenDetail} onChangeText={(v) => updateField('childrenDetail', v)} />}
              <SelectButtons label="身内の承諾" options={['承認を得ている', '承認を得ていない']} selectedValue={form.familyApproval} onSelect={(v) => updateField('familyApproval', v)} />
            </Section>
            <View style={styles.consentCard}><Text style={styles.consentText}>記入内容に事実に相違ない場合、チェックしてください</Text><Switch value={isAgreed} onValueChange={(v) => setIsAgreed(v)} trackColor={{ false: "#ccc", true: "#FF77A9" }} /></View>
            <TouchableOpacity style={[styles.submitButton, (!isAgreed || isSubmitting) && styles.submitButtonDisabled]} onPress={handleViewSubmit} disabled={!isAgreed || isSubmitting}>
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>内容を確認して送信</Text>}
            </TouchableOpacity>
            {submitError !== "" && <View style={styles.errorBanner}><Text style={styles.errorBannerText}>{submitError}</Text></View>}
            <View style={{ height: 60 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF0F5' }, header: { paddingVertical: 20, alignItems: 'center' }, headerTitle: { ...fontSettings, fontSize: 18, fontWeight: 'bold', color: '#ff69b4' }, scrollView: { flex: 1 }, content: { padding: 16 }, section: { marginBottom: 30, backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 }, sectionTitle: { ...fontSettings, fontSize: 17, fontWeight: 'bold', color: '#FF77A9', marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#FF77A9', paddingLeft: 10 }, sectionDescription: { ...fontSettings, fontSize: 11, color: '#888', marginBottom: 16 }, inputContainer: { marginBottom: 14 }, labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 }, label: { ...fontSettings, fontSize: 13, color: '#333', fontWeight: 'bold' }, requiredTag: { ...fontSettings, fontSize: 10, color: '#fff', backgroundColor: '#FF3B30', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, marginLeft: 8 }, input: { ...fontSettings, backgroundColor: '#FFF5F7', borderRadius: 8, padding: 12, fontSize: 15, color: '#333', borderWidth: 1, borderColor: '#FFB7C5' }, errorText: { ...fontSettings, color: '#FF3B30', fontSize: 11, marginTop: 4 }, textArea: { height: 70, textAlignVertical: 'top' }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }, dropdownTrigger: { backgroundColor: '#FFF5F7', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#FFB7C5', minHeight: 48, justifyContent: 'center' }, dropdownText: { ...fontSettings, fontSize: 14, color: '#333', textAlign: 'center' }, modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }, modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 }, modalHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE', alignItems: 'center' }, modalTitle: { ...fontSettings, fontSize: 16, fontWeight: 'bold', color: '#D87093' }, modalItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, modalItemText: { ...fontSettings, fontSize: 16, color: '#333' }, checkmark: { color: '#FF77A9', fontWeight: 'bold', fontSize: 18 }, buttonRow: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -2 }, selectBtn: { flexGrow: 1, minWidth: '30%', backgroundColor: '#FFF5F7', padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#FFB7C5', margin: 2 }, selectBtnActive: { backgroundColor: '#FF77A9', borderColor: '#FF77A9' }, selectBtnText: { ...fontSettings, fontSize: 11, color: '#D87093', fontWeight: '600' }, selectBtnTextActive: { color: '#fff' }, consentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#FF77A9' }, consentText: { ...fontSettings, flex: 1, fontSize: 12, color: '#333', fontWeight: '600' }, submitButton: { backgroundColor: '#FF77A9', padding: 18, borderRadius: 12, alignItems: 'center' }, submitButtonDisabled: { backgroundColor: '#FFD1E3' }, submitButtonText: { ...fontSettings, color: '#fff', fontSize: 16, fontWeight: 'bold' }, historyCard: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#FFB7C5' }, historyLabel: { ...fontSettings, fontSize: 14, fontWeight: 'bold', color: '#D87093', marginBottom: 10 }, errorBanner: { marginTop: 15, alignItems: 'center' }, errorBannerText: { ...fontSettings, color: '#FF3B30', fontSize: 14, fontWeight: 'bold' }, successPage: { flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingBottom: 40 }, fullWidthLogo: { width: '100%', height: 120, marginTop: 60, marginBottom: 20 }, successTextContainer: { paddingHorizontal: 20, alignItems: 'center' }, successTitle: { ...fontSettings, fontSize: 22, fontWeight: 'bold', color: '#FF77A9', marginBottom: 15 }, successMessage: { ...fontSettings, fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 40 }, successButtonRow: { flexDirection: 'row', paddingHorizontal: 20, width: '100%' }, backButton: { backgroundColor: '#FF77A9', paddingVertical: 15, borderRadius: 12, flex: 1, alignItems: 'center', elevation: 2 }, backButtonText: { ...fontSettings, color: '#fff', fontWeight: 'bold', fontSize: 14 }, dynamicSubSection: { marginTop: 15, padding: 10, backgroundColor: '#FFF5F7', borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#FF77A9' }, subSectionTitle: { ...fontSettings, fontSize: 13, color: '#D87093', fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
});
