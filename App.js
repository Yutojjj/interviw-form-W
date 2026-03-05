import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Switch,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Pressable,
  Image,
  Linking,
} from 'react-native';

// --- フォント・共通設定 ---
const fontSettings = {
  fontFamily: Platform.OS === 'ios' ? 'Hiragino Sans Round' : 'sans-serif-medium',
  letterSpacing: 0.5,
};

// --- 動的なリスト生成設定 ---
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 53 }, (_, i) => (currentYear - 18 - i).toString());
const ages = Array.from({ length: 43 }, (_, i) => (18 + i).toString());
const w_range = Array.from({ length: 41 }, (_, i) => (40 + i).toString());
const bh_range = Array.from({ length: 51 }, (_, i) => (60 + i).toString());
const hourlyWages = Array.from({ length: 15 }, (_, i) => ((i + 1) * 1000).toLocaleString());
hourlyWages.push("15,000以上");

// --- 共通コンポーネント ---
const Section = ({ title, description, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {description && <Text style={styles.sectionDescription}>{description}</Text>}
    {children}
  </View>
);

const InputField = ({ 
  label, placeholder, multiline = false, flex = 1, keyboardType = 'default',
  value, onChangeText, error = false, required = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={[styles.inputContainer, { flex }]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.requiredTag}>必須</Text>}
      </View>
      <TextInput
        style={[
          styles.input, 
          multiline && styles.textArea, 
          error && styles.inputError,
          isFocused && { borderBottomColor: '#FF77A9', borderBottomWidth: 2 }
        ]}
        placeholder={placeholder}
        placeholderTextColor="#FFC1D6"
        multiline={multiline}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
        selectionColor="#FF77A9"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error && <Text style={styles.errorText}>入力してください</Text>}
    </View>
  );
};

const DropdownSelector = ({ label, options, selectedValue, onSelect, error, required, flex = 1, suffix = "", placeholder = "選択 ▼" }) => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View style={[styles.inputContainer, { flex }]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.requiredTag}>必須</Text>}
      </View>
      <TouchableOpacity 
        style={[styles.dropdownTrigger, error && styles.inputError]} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.dropdownText, !selectedValue && { color: '#FFC1D6' }]}>
          {selectedValue ? `${selectedValue}${suffix}` : placeholder}
        </Text>
      </TouchableOpacity>
      <Modal transparent={true} visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>{label}を選択</Text></View>
            <ScrollView style={{ maxHeight: 400 }}>
              {options.map((item) => (
                <TouchableOpacity 
                  key={item.toString()} 
                  style={[styles.modalItem, selectedValue === item.toString() && { backgroundColor: '#FFF0F5' }]}
                  onPress={() => { onSelect(item.toString()); setModalVisible(false); }}
                >
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
    <View style={styles.labelRow}>
      <Text style={styles.label}>{label}</Text>
      {required && <Text style={styles.requiredTag}>必須</Text>}
    </View>
    <View style={styles.buttonRow}>
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
    <View style={styles.labelRow}>
      <Text style={styles.label}>{label}</Text>
      {required && <Text style={styles.requiredTag}>必須</Text>}
    </View>
    <View style={styles.buttonRow}>
      {options.map((opt) => (
        <TouchableOpacity key={opt} style={[styles.selectBtn, selectedValues.includes(opt) && styles.selectBtnActive]} onPress={() => onToggle(opt)}>
          <Text style={[styles.selectBtnText, selectedValues.includes(opt) && styles.selectBtnTextActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
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

  const [form, setForm] = useState({
    name: '', kana: '', stageName: '', birthY: '', birthM: '', birthD: '', age: '', zodiac: '', bloodType: '', 
    height: '', weight: '', cup: '', b: '', w: '', h: '', phone: '', address: '', domicileStatus: '', domicileCustom: '', 
    livingStatus: '', livingStatusCustom: '', jobDay: '', jobNight: '', language: [], languageCustom: '', 
    applyMethod: '', introducer: '', applyMethodCustom: '', motivationStatus: '', motivationCustom: '', desiredWage: '', 
    daysPerWeek: '', availableDays: [], nightJobExp: '', alcohol: '', transport: '', transportCustom: '',
    hobby: '', skill: '', qualifications: '', salesTarget: '', shopConditions: '',
    rental: [], shooting: '', shootingDetail: [], birthdayWill: '', accompaniment: '',
    deliveryTrialStatus: '', deliveryTrialCustom: '', deliveryPostStatus: '', deliveryPostCustom: '', 
    trialWorkTimeStatus: '', trialWorkTimeCustom: '', postWorkTimeStatus: '', postWorkTimeCustom: '',
    familyStatus: [], familyApproval: '', illness: '', illnessDetail: '', debt: '', debtDetail: '',
    tattoo: '', tattooDetail: '', emName: '', emRelationStatus: '', emRelationCustom: '', emPhone: '', emAddressStatus: '', emAddressCustom: '',
    n1Name: '', n1Wage: '', n1Sales: '', n1QuitDate: '', n1QuitReason: '',
    n2Name: '', n2Wage: '', n2Sales: '', n2QuitDate: '', n2QuitReason: '',
    n3Name: '', n3Wage: '', n3Sales: '', n3QuitDate: '', n3QuitReason: '',
    n4Name: '', n4Wage: '', n4Sales: '', n4QuitDate: '', n4QuitReason: '',
    n5Name: '', n5Wage: '', n5Sales: '', n5QuitDate: '', n5QuitReason: ''
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
  };

  const handleClose = () => {
    Linking.openURL('https://warp-net.jp/'); 
  };

  const handleViewSubmit = async () => {
    setSubmitError(""); setIsSent(false);
    let newErrors = {};
    const requiredList = [
      'name', 'kana', 'birthY', 'birthM', 'birthD', 'age', 'zodiac', 'bloodType', 'phone', 'address', 'domicileStatus', 'height', 'weight', 'cup',
      'livingStatus', 'jobDay', 'jobNight', 'applyMethod', 'daysPerWeek', 'availableDays', 'desiredWage', 'nightJobExp',
      'deliveryTrialStatus', 'deliveryPostStatus', 'motivationStatus', 'emName', 'emRelationStatus', 'emPhone', 'emAddressStatus', 'alcohol', 'trialWorkTimeStatus', 'postWorkTimeStatus'
    ];
    requiredList.forEach(key => { if (!form[key] || form[key].toString().trim() === '') newErrors[key] = true; });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitError("入力内容に不備があります。赤枠の項目を確認してください。");
      return;
    }
    if (!isAgreed) { setSubmitError("同意チェックをオンにしてください。"); return; }

    setIsSubmitting(true);
    try {
      const searchParams = new URLSearchParams();
      Object.keys(form).forEach(key => {
        if (Array.isArray(form[key])) { 
          searchParams.append(key, form[key].join(', ')); 
        } else { 
          searchParams.append(key, form[key]); 
        }
      });
      searchParams.append('timestamp', new Date().toLocaleString('ja-JP'));
      searchParams.append('formType', 'cast'); 

      await fetch("https://script.google.com/macros/s/AKfycbzHlt307bv8R9xfEOZTdeNhZNwtmD9d-bC3a7Ja7M1-4_EScQSTF9TlV35DHDez1NeJ6A/exec", { 
        method: 'POST', 
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: searchParams.toString() 
      });
      setIsSent(true);
    } catch (e) { 
      setSubmitError("通信エラーが発生しました。"); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {isSent ? (
        <View style={styles.successPage}>
          <Image source={require('./assets/LOGO.png')} style={styles.fullWidthLogo} resizeMode="contain" />
          <View style={styles.successTextContainer}>
            <Text style={styles.successTitle}>送信が完了しました</Text>
            <Text style={styles.successMessage}>
              面接フォームのご記入ありがとうございます。{"\n"}
              テーブル上の呼び出しボタンを押して面接担当者をお待ちください
            </Text>
          </View>
          <View style={styles.successButtonRow}>
            <TouchableOpacity style={[styles.backButton, { backgroundColor: '#888' }]} onPress={() => setIsSent(false)} >
              <Text style={styles.backButtonText}>入力し直す</Text>
            </TouchableOpacity>
            <View style={{ width: 15 }} />
            <TouchableOpacity style={styles.backButton} onPress={handleClose} >
              <Text style={styles.backButtonText}>画面を閉じる</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
          <View style={styles.header}><Text style={styles.headerTitle}>【キャスト用面接フォーム】</Text></View>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

            <Section title="基本プロフィール">
              <InputField label="お名前" placeholder="例：山田 花子" required value={form.name} onChangeText={(v) => updateField('name', v)} error={errors.name} />
              <InputField label="かな" placeholder="例：やまだ はなこ" required value={form.kana} onChangeText={(v) => updateField('kana', v)} error={errors.kana} />
              <View style={styles.labelRow}><Text style={styles.label}>生年月日</Text><Text style={styles.requiredTag}>必須</Text></View>
              <View style={styles.row}>
                <DropdownSelector label="年" options={years} selectedValue={form.birthY} onSelect={(v) => updateField('birthY', v)} flex={1}  />
                <DropdownSelector label="月" options={Array.from({length:12},(_,i)=>(i+1).toString())} selectedValue={form.birthM} onSelect={(v) => updateField('birthM', v)} flex={1}  />
                <DropdownSelector label="日" options={Array.from({length:31},(_,i)=>(i+1).toString())} selectedValue={form.birthD} onSelect={(v) => updateField('birthD', v)} flex={1}  />
              </View>

              <View style={styles.row}>
                <DropdownSelector label="年齢" options={ages} selectedValue={form.age} onSelect={(v) => updateField('age', v)} suffix="歳" required />
                <DropdownSelector label="干支" options={['ねずみ', 'うし', 'とら', 'うさぎ', 'たつ', 'へび', 'うま', 'ひつじ', 'さる', 'とり', 'いぬ', 'いのしし']} selectedValue={form.zodiac} onSelect={(v) => updateField('zodiac', v)} required/>
                <DropdownSelector label="血液型" options={['A','B','O','AB']} selectedValue={form.bloodType} onSelect={(v) => updateField('bloodType', v)} suffix="型" required />
              </View>

              <View style={styles.row}>
                <DropdownSelector label="身長" options={Array.from({length:51},(_,i)=>(135+i).toString())} selectedValue={form.height} onSelect={(v) => updateField('height', v)} suffix="cm" required  />
                <DropdownSelector label="体重" options={Array.from({length:61},(_,i)=>(30+i).toString())} selectedValue={form.weight} onSelect={(v) => updateField('weight', v)} suffix="kg" required  />
                <DropdownSelector label="カップ" options={['A','B','C','D','E','F','G','H','I','J']} selectedValue={form.cup} onSelect={(v) => updateField('cup', v)} suffix="カップ" required  />
              </View>

              <View style={styles.labelRow}><Text style={styles.label}>B / W / H</Text></View>
              <View style={styles.row}>
                <DropdownSelector label="B" options={bh_range} selectedValue={form.b} onSelect={(v) => updateField('b', v)} suffix="cm" />
                <DropdownSelector label="W" options={w_range} selectedValue={form.w} onSelect={(v) => updateField('w', v)} suffix="cm"  />
                <DropdownSelector label="H" options={bh_range} selectedValue={form.h} onSelect={(v) => updateField('h', v)} suffix="cm"  />
              </View>

              <InputField label="携帯番号" placeholder="ハイフンなし" keyboardType="phone-pad" required value={form.phone} onChangeText={(v) => updateField('phone', v)} error={errors.phone} />
              
              <InputField label="現住所" multiline placeholder="例：愛知県名古屋市北区..." required value={form.address} onChangeText={(v) => updateField('address', v)} error={errors.address} />
              
              <SelectButtons label="本籍地" options={['現住所と同じ', 'その他']} required selectedValue={form.domicileStatus} onSelect={(v) => updateField('domicileStatus', v)} error={errors.domicileStatus} />
              {form.domicileStatus === 'その他' && <InputField label="本籍地詳細" placeholder="都道府県から" required value={form.domicileCustom} onChangeText={(v) => updateField('domicileCustom', v)} error={errors.domicileCustom} />}
              
              <SelectButtons label="お住まい状況" options={['実家', '一人暮らし', '友人宅', '彼氏と同居','その他']} required selectedValue={form.livingStatus} onSelect={(v) => updateField('livingStatus', v)} error={errors.livingStatus} />
              {form.livingStatus === 'その他' && <InputField label="詳細" placeholder="例：寮など" required value={form.livingStatusCustom} onChangeText={(v) => updateField('livingStatusCustom', v)} error={errors.livingStatusCustom} />}
            </Section>

            <Section title="緊急連絡先">
              <InputField label="ご氏名" placeholder="山田 太郎" required value={form.emName} onChangeText={(v) => updateField('emName', v)} error={errors.emName} />

              <SelectButtons label="続柄" options={['父', '母', '兄', '弟', '姉', '祖父母', 'その他']} required selectedValue={form.emRelationStatus} onSelect={(v) => updateField('emRelationStatus', v)} error={errors.emRelationStatus} />
              {form.emRelationStatus === 'その他' && <InputField label="具体的な続柄" placeholder="例：叔父" required value={form.emRelationCustom} onChangeText={(v) => updateField('emRelationCustom', v)} error={errors.emRelationCustom} />}

              <InputField label="電話番号" placeholder="ハイフンなし" required keyboardType="phone-pad" value={form.emPhone} onChangeText={(v) => updateField('emPhone', v)} error={errors.emPhone} />
              
              <SelectButtons label="住所" options={['現住所と同じ', 'その他']} required selectedValue={form.emAddressStatus} onSelect={(v) => updateField('emAddressStatus', v)} error={errors.emAddressStatus} />
              {form.emAddressStatus === 'その他' && <InputField label="住所詳細" multiline required placeholder="愛知県名古屋市中区..." value={form.emAddressCustom} onChangeText={(v) => updateField('emAddressCustom', v)} error={errors.emAddressCustom} />}
            </Section>

            <Section title="勤務条件・希望">
              <SelectButtons label="応募方法" options={['紹介','WARPスタッフの紹介','求人広告','その他']} required selectedValue={form.applyMethod} onSelect={(v) => updateField('applyMethod', v)} error={errors.applyMethod} />
              {['紹介','WARPスタッフの紹介'].includes(form.applyMethod) && <InputField label="紹介者名" required value={form.introducer} onChangeText={(v) => updateField('introducer', v)} error={errors.introducer} />}
              {form.applyMethod === 'その他' && <InputField label="詳細" required value={form.applyMethodCustom} onChangeText={(v) => updateField('applyMethodCustom', v)} error={errors.applyMethodCustom} />}
              <SelectButtons label="週何回入れますか" options={['未定','5-6日','3-4日','1-2日','0-1日']} required selectedValue={form.daysPerWeek} onSelect={(v) => updateField('daysPerWeek', v)} error={errors.daysPerWeek} />
              <MultiSelectButtons label="何曜日入れますか" options={['未定','月','火','水','木','金','土','日']} required selectedValues={form.availableDays} onToggle={(v) => toggleMulti('availableDays', v)} error={errors.availableDays} />
              <DropdownSelector label="希望時給" options={hourlyWages} selectedValue={form.desiredWage} onSelect={(v) => updateField('desiredWage', v)} suffix="円" required placeholder="選択" />
              
              <SelectButtons label="志望動機" options={['興味があった', 'お金が欲しい', '社会貢献', '自分磨き', 'その他']} required selectedValue={form.motivationStatus} onSelect={(v) => updateField('motivationStatus', v)} error={errors.motivationStatus} />
              {form.motivationStatus !== '' && <InputField label="その理由" multiline value={form.motivationCustom} onChangeText={(v) => updateField('motivationCustom', v)} />}
              
              <InputField label="源氏名" placeholder="希望があれば" value={form.stageName} onChangeText={(v) => updateField('stageName', v)} />
            </Section>

            <Section title="時間・送り">
              <SelectButtons label="体験時時間" options={['LASTまで', '25時まで', '24時まで', '終電まで', 'その他']} required selectedValue={form.trialWorkTimeStatus} onSelect={(v) => updateField('trialWorkTimeStatus', v)} error={errors.trialWorkTimeStatus} />
              {form.trialWorkTimeStatus === 'その他' && <InputField label="詳細時間" required value={form.trialWorkTimeCustom} onChangeText={(v) => updateField('trialWorkTimeCustom', v)} error={errors.trialWorkTimeCustom} />}
              
              <SelectButtons label="入店後時間" options={['LASTまで', '25時まで', '24時まで', '終電まで', 'その他']} required selectedValue={form.postWorkTimeStatus} onSelect={(v) => updateField('postWorkTimeStatus', v)} error={errors.postWorkTimeStatus} />
              {form.postWorkTimeStatus === 'その他' && <InputField label="詳細時間" required value={form.postWorkTimeCustom} onChangeText={(v) => updateField('postWorkTimeCustom', v)} error={errors.postWorkTimeCustom} />}
              
              <SelectButtons label="送り先エリア：体験時" options={['現住所と同じ', 'その他']} required selectedValue={form.deliveryTrialStatus} onSelect={(v) => updateField('deliveryTrialStatus', v)} error={errors.deliveryTrialStatus} />
              {form.deliveryTrialStatus === 'その他' && <InputField label="送り先詳細" required value={form.deliveryTrialCustom} onChangeText={(v) => updateField('deliveryTrialCustom', v)} error={errors.deliveryTrialCustom} />}
              
              <SelectButtons label="送り先エリア：入店後" options={['現住所と同じ', 'その他']} required selectedValue={form.deliveryPostStatus} onSelect={(v) => updateField('deliveryPostStatus', v)} error={errors.deliveryPostStatus} />
              {form.deliveryPostStatus === 'その他' && <InputField label="送り先詳細" required value={form.deliveryPostCustom} onChangeText={(v) => updateField('deliveryPostCustom', v)} error={errors.deliveryPostCustom} />}
            </Section>

            <Section title="勤務情報">
              <SelectButtons label="現在の職業 [昼職]" options={['学生','社会人','フリーター','自営業','なし']} required selectedValue={form.jobDay} onSelect={(v) => updateField('jobDay', v)} error={errors.jobDay} />
              <SelectButtons label="現在の職業 [夜職]" options={['学生','社会人','キャバクラ等','自営業','なし']} required selectedValue={form.jobNight} onSelect={(v) => updateField('jobNight', v)} error={errors.jobNight} />
              <MultiSelectButtons label="語学" options={['日本語のみ', '英語', '中国語', 'その他']} required selectedValues={form.language} onToggle={(v) => toggleMulti('language', v)} error={errors.language} />
              {form.language.includes('その他') && <InputField label="詳細" required value={form.languageCustom} onChangeText={(v) => updateField('languageCustom', v)} error={errors.languageCustom} />}
              <SelectButtons label="お酒" options={['強い','飲める','少し','NG']} required selectedValue={form.alcohol} onSelect={(v) => updateField('alcohol', v)} error={errors.alcohol} />
              <SelectButtons label="水商売の経験" options={['ある', 'ない']} required selectedValue={form.nightJobExp} onSelect={(v) => updateField('nightJobExp', v)} error={errors.nightJobExp} />
            </Section>

            {form.nightJobExp === 'ある' && (
              <Section title="過去の職歴 (夜職)">
                {[1,2,3,4,5].map(n => <WorkHistoryCard key={n} symbol={n} prefix={`n${n}`} data={form} updateField={updateField} />)}
              </Section>
            )}

            <Section title="詳細情報">
              <View style={styles.row}>
                <InputField label="趣味" value={form.hobby} onChangeText={(v) => updateField('hobby', v)} flex={1} />
                <View style={{width:10}}/><InputField label="特技" value={form.skill} onChangeText={(v) => updateField('skill', v)} flex={1} />
              </View>
              <InputField label="保有資格" value={form.qualifications} onChangeText={(v) => updateField('qualifications', v)} />
              <InputField label="月売上目標" value={form.salesTarget} onChangeText={(v) => updateField('salesTarget', v)} />
              <InputField label="店への希望条件" value={form.shopConditions} onChangeText={(v) => updateField('shopConditions', v)} />
              
              <SelectButtons label="交通手段" options={['車', '電車', '自転車', 'その他']} selectedValue={form.transport} onSelect={(v) => updateField('transport', v)} />
              {form.transport === 'その他' && <InputField label="詳細" value={form.transportCustom} onChangeText={(v) => updateField('transportCustom', v)} />}
              
              <MultiSelectButtons label="レンタル希望" options={['ドレス', 'ヒール', 'ハンカチ', 'ポーチ']} selectedValues={form.rental} onToggle={(v) => toggleMulti('rental', v)} />
              <SelectButtons label="撮影/掲載" options={['できる', 'できない']} selectedValue={form.shooting} onSelect={(v) => updateField('shooting', v)} />
              {form.shooting === 'できる' && <MultiSelectButtons label="掲載媒体" options={['ナイツ', '公式サイト', '看板']} selectedValues={form.shootingDetail} onToggle={(v) => toggleMulti('shootingDetail', v)} />}
              <View style={styles.row}>
                <SelectButtons label="バースデー" options={['ある', 'ない']} selectedValue={form.birthdayWill} onSelect={(v) => updateField('birthdayWill', v)} />
                <View style={{width:10}}/><SelectButtons label="同伴・アフター" options={['できる', 'できない']} selectedValue={form.accompaniment} onSelect={(v) => updateField('accompaniment', v)} />
              </View>
              <SelectButtons label="借金" options={['ある', 'ない']} selectedValue={form.debt} onSelect={(v) => updateField('debt', v)} />
              {form.debt === 'ある' && <InputField label="詳細" value={form.debtDetail} onChangeText={(v) => updateField('debtDetail', v)} />}
              <SelectButtons label="持病" options={['ある', 'ない']} selectedValue={form.illness} onSelect={(v) => updateField('illness', v)} />
              {form.illness === 'ある' && <InputField label="詳細" value={form.illnessDetail} onChangeText={(v) => updateField('illnessDetail', v)} />}
              <SelectButtons label="タトゥー" options={['ある', 'ない']} selectedValue={form.tattoo} onSelect={(v) => updateField('tattoo', v)} />
              {form.tattoo === 'ある' && <InputField label="部位・大きさ" value={form.tattooDetail} onChangeText={(v) => updateField('tattooDetail', v)} />}
              <MultiSelectButtons label="家族構成" options={['独身', '夫がいる', 'こどもがいる']} selectedValues={form.familyStatus} onToggle={(v) => toggleMulti('familyStatus', v)} />
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
  safeArea: { flex: 1, backgroundColor: '#FFF0F5' },
  header: { paddingVertical: 20, alignItems: 'center' },
  headerTitle: { ...fontSettings, fontSize: 18, fontWeight: 'bold', color: '#ff69b4' },
  scrollView: { flex: 1 },
  content: { padding: 16 },
  section: { marginBottom: 30, backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  sectionTitle: { ...fontSettings, fontSize: 17, fontWeight: 'bold', color: '#FF77A9', marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#FF77A9', paddingLeft: 10 },
  sectionDescription: { ...fontSettings, fontSize: 11, color: '#888', marginBottom: 16 },
  inputContainer: { marginBottom: 14 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  label: { ...fontSettings, fontSize: 13, color: '#333', fontWeight: 'bold' },
  requiredTag: { ...fontSettings, fontSize: 10, color: '#fff', backgroundColor: '#FF3B30', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  input: { ...fontSettings, backgroundColor: '#FFF5F7', borderRadius: 8, padding: 12, fontSize: 15, color: '#333', borderWidth: 1, borderColor: '#FFB7C5' },
  inputError: { borderBottomColor: '#FF3B30', borderBottomWidth: 2 },
  errorText: { ...fontSettings, color: '#FF3B30', fontSize: 11, marginTop: 4 },
  textArea: { height: 70, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  dropdownTrigger: { backgroundColor: '#FFF5F7', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#FFB7C5', minHeight: 48, justifyContent: 'center' },
  dropdownText: { ...fontSettings, fontSize: 14, color: '#333', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 },
  modalHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE', alignItems: 'center' },
  modalTitle: { ...fontSettings, fontSize: 16, fontWeight: 'bold', color: '#D87093' },
  modalItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalItemText: { ...fontSettings, fontSize: 16, color: '#333' },
  checkmark: { color: '#FF77A9', fontWeight: 'bold', fontSize: 18 },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -2 },
  selectBtn: { flexGrow: 1, minWidth: '30%', backgroundColor: '#FFF5F7', padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#FFB7C5', margin: 2 },
  selectBtnActive: { backgroundColor: '#FF77A9', borderColor: '#FF77A9' },
  selectBtnText: { ...fontSettings, fontSize: 11, color: '#D87093', fontWeight: '600' },
  selectBtnTextActive: { color: '#fff' },
  consentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#FF77A9' },
  consentText: { ...fontSettings, flex: 1, fontSize: 12, color: '#333', fontWeight: '600' },
  submitButton: { backgroundColor: '#FF77A9', padding: 18, borderRadius: 12, alignItems: 'center' },
  submitButtonDisabled: { backgroundColor: '#FFD1E3' },
  submitButtonText: { ...fontSettings, color: '#fff', fontSize: 16, fontWeight: 'bold' },
  historyCard: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#FFB7C5' },
  historyLabel: { ...fontSettings, fontSize: 14, fontWeight: 'bold', color: '#D87093', marginBottom: 10 },
  errorBanner: { marginTop: 15, alignItems: 'center' },
  errorBannerText: { ...fontSettings, color: '#FF3B30', fontSize: 14, fontWeight: 'bold' },
  
  // --- 送信完了画面のスタイル ---
  successPage: { flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingBottom: 40 },
  fullWidthLogo: { width: '100%', height: 120, marginTop: 60, marginBottom: 20 },
  successTextContainer: { paddingHorizontal: 20, alignItems: 'center' },
  successTitle: { ...fontSettings, fontSize: 22, fontWeight: 'bold', color: '#FF77A9', marginBottom: 15 },
  successMessage: { ...fontSettings, fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  successButtonRow: { flexDirection: 'row', paddingHorizontal: 20, width: '100%' },
  backButton: { backgroundColor: '#FF77A9', paddingVertical: 15, borderRadius: 12, flex: 1, alignItems: 'center', elevation: 2 },
  backButtonText: { ...fontSettings, color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
