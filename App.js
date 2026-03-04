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
  Alert,
  Modal,
  ActivityIndicator,
  Pressable,
} from 'react-native';

// --- フォント・共通設定 ---
const fontSettings = {
  fontFamily: Platform.OS === 'ios' ? 'Hiragino Sans Round' : 'sans-serif-medium',
  letterSpacing: 0.5,
};

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
    height: '', weight: '', cup: '', b: '', w: '', h: '', phone: '', address: '', domicile: '', 
    livingStatus: '', livingStatusCustom: '', jobDay: '', jobNight: '', language: [], languageCustom: '', 
    applyMethod: '', introducer: '', applyMethodCustom: '', motivation: '', desiredWage: '', 
    daysPerWeek: '', availableDays: [], nightJobExp: '', alcohol: '', transport: '', transportCustom: '',
    hobby: '', skill: '', qualifications: '', salesTarget: '', shopConditions: '',
    rental: [], shooting: '', shootingDetail: [], birthdayWill: '', accompaniment: '',
    deliveryTrial: '', deliveryPost: '', trialWorkTime: '', trialWorkTimeCustom: '', postWorkTime: '', postWorkTimeCustom: '',
    familyStatus: [], familyApproval: '', illness: '', illnessDetail: '', debt: '', debtDetail: '',
    tattoo: '', tattooDetail: '', emName: '', emRelation: '', emPhone: '', emAddress: '',
    n1Name: '', n1Wage: '', n1Sales: '', n1QuitDate: '', n1QuitReason: '',
    n2Name: '', n2Wage: '', n2Sales: '', n2QuitDate: '', n2QuitReason: '',
    n3Name: '', n3Wage: '', n3Sales: '', n3QuitDate: '', n3QuitReason: '',
    n4Name: '', n4Wage: '', n4Sales: '', n4QuitDate: '', n4QuitReason: '',
    n5Name: '', n5Wage: '', n5Sales: '', n5QuitDate: '', n5QuitReason: ''
  });
  
  const [errors, setErrors] = useState({});

  const years = Array.from({ length: 50 }, (_, i) => (2008 - i).toString());
  const ages = Array.from({ length: 43 }, (_, i) => (18 + i).toString());
  const w_range = Array.from({ length: 41 }, (_, i) => (40 + i).toString());
  const bh_range = Array.from({ length: 51 }, (_, i) => (60 + i).toString());
  const hourlyWages = Array.from({ length: 15 }, (_, i) => ((i + 1) * 1000).toLocaleString());
  hourlyWages.push("15,000以上");

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

  const handleViewSubmit = async () => {
    setSubmitError(""); setIsSent(false);
    let newErrors = {};
    const requiredList = [
      'name', 'kana', 'birthY', 'birthM', 'birthD', 'age', 'zodiac', 'bloodType', 'phone', 'address', 'domicile', 'height', 'weight', 'cup',
      'livingStatus', 'jobDay', 'jobNight', 'language', 'applyMethod', 'daysPerWeek', 'availableDays', 'desiredWage', 'nightJobExp',
      'deliveryTrial', 'deliveryPost', 'motivation', 'emName', 'emRelation', 'emPhone', 'emAddress', 'alcohol', 'trialWorkTime', 'postWorkTime'
    ];
    requiredList.forEach(key => { if (!form[key] || form[key].toString().trim() === '') newErrors[key] = true; });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitError("入力内容に不備があります。赤枠の項目を確認してください。");
      return;
    }
    if (!isAgreed) { setSubmitError("同意チェックをオンにしてください。"); return; }

    setIsSubmitting(true);
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

      await fetch("https://script.google.com/macros/s/AKfycbxeeqsgOqpOjDCntv2F8Ry2f2gzqqbQUSYsJy0zkTCQOQPS2fE6_FgLIZ0ivz6AZqmjCA/exec", { 
        method: 'POST', 
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: searchParams.toString() 
      });
      // ...以下略
      setIsSent(true);
    } catch (e) { 
      setSubmitError("通信エラーが発生しました。"); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <View style={styles.header}><Text style={styles.headerTitle}>キャストエントリーシート</Text></View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          <Section title="基本プロフィール">
            <InputField label="お名前" placeholder="例：山田 花子" required value={form.name} onChangeText={(v) => updateField('name', v)} error={errors.name} />
            <InputField label="かな" placeholder="例：やまだ はなこ" required value={form.kana} onChangeText={(v) => updateField('kana', v)} error={errors.kana} />
            <InputField label="源氏名" placeholder="例：れいな" value={form.stageName} onChangeText={(v) => updateField('stageName', v)} />
            
            <View style={styles.labelRow}><Text style={styles.label}>生年月日</Text><Text style={styles.requiredTag}>必須</Text></View>
            <View style={styles.row}>
              <DropdownSelector label="年" options={years} selectedValue={form.birthY} onSelect={(v) => updateField('birthY', v)} flex={2} placeholder="年" />
              <DropdownSelector label="月" options={Array.from({length:12},(_,i)=>(i+1).toString())} selectedValue={form.birthM} onSelect={(v) => updateField('birthM', v)} flex={1} placeholder="月" />
              <DropdownSelector label="日" options={Array.from({length:31},(_,i)=>(i+1).toString())} selectedValue={form.birthD} onSelect={(v) => updateField('birthD', v)} flex={1} placeholder="日" />
            </View>

            <View style={styles.row}>
              <DropdownSelector label="年齢" options={ages} selectedValue={form.age} onSelect={(v) => updateField('age', v)} suffix="歳" required placeholder="年齢" />
              <DropdownSelector label="干支" options={['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']} selectedValue={form.zodiac} onSelect={(v) => updateField('zodiac', v)} required placeholder="干支" />
              <DropdownSelector label="血液型" options={['A','B','O','AB']} selectedValue={form.bloodType} onSelect={(v) => updateField('bloodType', v)} suffix="型" required placeholder="型" />
            </View>

            <View style={styles.row}>
              <DropdownSelector label="身長" options={Array.from({length:51},(_,i)=>(135+i).toString())} selectedValue={form.height} onSelect={(v) => updateField('height', v)} suffix="cm" required placeholder="身長" />
              <DropdownSelector label="体重" options={Array.from({length:61},(_,i)=>(30+i).toString())} selectedValue={form.weight} onSelect={(v) => updateField('weight', v)} suffix="kg" required placeholder="体重" />
              <DropdownSelector label="カップ" options={['A','B','C','D','E','F','G','H','I','J以上']} selectedValue={form.cup} onSelect={(v) => updateField('cup', v)} suffix="カップ" required placeholder="カップ" />
            </View>

            <View style={styles.labelRow}><Text style={styles.label}>B / W / H (任意)</Text></View>
            <View style={styles.row}>
              <DropdownSelector label="B" options={bh_range} selectedValue={form.b} onSelect={(v) => updateField('b', v)} suffix="cm" placeholder="B" />
              <DropdownSelector label="W" options={w_range} selectedValue={form.w} onSelect={(v) => updateField('w', v)} suffix="cm" placeholder="W" />
              <DropdownSelector label="H" options={bh_range} selectedValue={form.h} onSelect={(v) => updateField('h', v)} suffix="cm" placeholder="H" />
            </View>

            <InputField label="携帯番号" placeholder="例：09012345678" keyboardType="phone-pad" required value={form.phone} onChangeText={(v) => updateField('phone', v)} error={errors.phone} />
            <InputField label="現住所" multiline placeholder="例：東京都港区六本木1-2-3" required value={form.address} onChangeText={(v) => updateField('address', v)} error={errors.address} />
            <InputField label="本籍地" placeholder="例：愛知県（都道府県から）" required value={form.domicile} onChangeText={(v) => updateField('domicile', v)} error={errors.domicile} />
            <SelectButtons label="お住まい" options={['実家', '一人暮らし', '友人宅', '彼氏と同居', 'その他']} required selectedValue={form.livingStatus} onSelect={(v) => updateField('livingStatus', v)} error={errors.livingStatus} />
            {form.livingStatus === 'その他' && <InputField label="詳細" placeholder="例：寮など" required value={form.livingStatusCustom} onChangeText={(v) => updateField('livingStatusCustom', v)} />}
          </Section>

          <Section title="職業・詳細状況">
            <SelectButtons label="現在の職業 [昼職]" options={['学生','社会人','フリーター/アルバイト','キャバクラ等','なし']} required selectedValue={form.jobDay} onSelect={(v) => updateField('jobDay', v)} error={errors.jobDay} />
            <SelectButtons label="現在の職業 [夜職]" options={['学生','社会人','フリーター/アルバイト','キャバクラ等','なし']} required selectedValue={form.jobNight} onSelect={(v) => updateField('jobNight', v)} error={errors.jobNight} />
            <SelectButtons label="水商売の経験" options={['ある', 'ない']} required selectedValue={form.nightJobExp} onSelect={(v) => updateField('nightJobExp', v)} error={errors.nightJobExp} />
            <MultiSelectButtons label="語学 (複数回答可)" options={['日本語のみ', '英語', '中国語', 'その他']} required selectedValues={form.language} onToggle={(v) => toggleMulti('language', v)} error={errors.language} />
            {form.language.includes('その他') && <InputField label="詳細" placeholder="例：韓国語" required value={form.languageCustom} onChangeText={(v) => updateField('languageCustom', v)} />}
            <SelectButtons label="お酒" options={['強い','飲める','少し飲める','あまり飲めない','NG']} required selectedValue={form.alcohol} onSelect={(v) => updateField('alcohol', v)} error={errors.alcohol} />
          </Section>

          {/* ★ 水商売の経験が「ある」の場合のみ職歴セクションを表示 ★ */}
          {form.nightJobExp === 'ある' && (
            <Section title="過去の職歴 (夜職)">
              {[1,2,3,4,5].map(n => <WorkHistoryCard key={n} symbol={n} prefix={`n${n}`} data={form} updateField={updateField} />)}
            </Section>
          )}

          <Section title="勤務条件・希望">
            <SelectButtons label="応募方法" options={['紹介','WARPスタッフの紹介','求人広告(ショコラ等)','その他']} required selectedValue={form.applyMethod} onSelect={(v) => updateField('applyMethod', v)} error={errors.applyMethod} />
            {['紹介','WARPスタッフの紹介'].includes(form.applyMethod) && <InputField label="紹介者名" placeholder="フルネーム" required value={form.introducer} onChangeText={(v) => updateField('introducer', v)} error={errors.introducer} />}
            {form.applyMethod === 'その他' && <InputField label="詳細" placeholder="具体的に" required value={form.applyMethodCustom} onChangeText={(v) => updateField('applyMethodCustom', v)} error={errors.applyMethodCustom} />}
            <SelectButtons label="週何日入れますか" options={['未定','5-6日','3-4日','1-2日','0-1日']} required selectedValue={form.daysPerWeek} onSelect={(v) => updateField('daysPerWeek', v)} error={errors.daysPerWeek} />
            <MultiSelectButtons label="何曜日入れますか" options={['未定','月','火','水','木','金','土','日']} required selectedValues={form.availableDays} onToggle={(v) => toggleMulti('availableDays', v)} error={errors.availableDays} />
            <DropdownSelector label="希望時給" options={hourlyWages} selectedValue={form.desiredWage} onSelect={(v) => updateField('desiredWage', v)} suffix="円" required placeholder="選択" />
            <InputField label="志望動機" multiline placeholder="例：将来の貯金のため" required value={form.motivation} onChangeText={(v) => updateField('motivation', v)} error={errors.motivation} />
          </Section>

          <Section title="勤務時間・送り先">
            <SelectButtons label="体験時時間" options={['20時-LAST', 'その他']} required selectedValue={form.trialWorkTime} onSelect={(v) => updateField('trialWorkTime', v)} error={errors.trialWorkTime} />
            {form.trialWorkTime === 'その他' && <InputField label="詳細" placeholder="例：21時〜" required value={form.trialWorkTimeCustom} onChangeText={(v) => updateField('trialWorkTimeCustom', v)} />}
            <SelectButtons label="入店後時間" options={['未定', '20時-LAST', 'その他']} required selectedValue={form.postWorkTime} onSelect={(v) => updateField('postWorkTime', v)} error={errors.postWorkTime} />
            {form.postWorkTime === 'その他' && <InputField label="詳細" placeholder="例：終電まで" required value={form.postWorkTimeCustom} onChangeText={(v) => updateField('postWorkTimeCustom', v)} />}
            <InputField label="送り先エリア：体験時" placeholder="例：名古屋市中区" required value={form.deliveryTrial} onChangeText={(v) => updateField('deliveryTrial', v)} error={errors.deliveryTrial} />
            <InputField label="送り先エリア：入店後" placeholder="例：同上" required value={form.deliveryPost} onChangeText={(v) => updateField('deliveryPost', v)} error={errors.deliveryPost} />
          </Section>

          <Section title="詳細ステータス">
            <View style={styles.row}>
              <InputField label="趣味" placeholder="例：旅行" value={form.hobby} onChangeText={(v) => updateField('hobby', v)} flex={1} />
              <View style={{width:10}}/><InputField label="特技" placeholder="例：ピアノ" value={form.skill} onChangeText={(v) => updateField('skill', v)} flex={1} />
            </View>
            <InputField label="保有資格" placeholder="例：普通免許、英検" value={form.qualifications} onChangeText={(v) => updateField('qualifications', v)} />
            <InputField label="売上目標" placeholder="例：月間100万" value={form.salesTarget} onChangeText={(v) => updateField('salesTarget', v)} />
            <InputField label="お探しの条件" placeholder="例：ノルマなし" value={form.shopConditions} onChangeText={(v) => updateField('shopConditions', v)} />
            <SelectButtons label="交通手段" options={['車', '電車', '自転車', 'その他']} selectedValue={form.transport} onSelect={(v) => updateField('transport', v)} />
            {form.transport === 'その他' && <InputField label="詳細" placeholder="原付等" value={form.transportCustom} onChangeText={(v) => updateField('transportCustom', v)} />}
            <MultiSelectButtons label="体験時レンタル" options={['ドレス', 'ヒール', 'ハンカチ', 'ポーチ']} selectedValues={form.rental} onToggle={(v) => toggleMulti('rental', v)} />
            <SelectButtons label="撮影/掲載" options={['できる', 'できない']} selectedValue={form.shooting} onSelect={(v) => updateField('shooting', v)} />
            {form.shooting === 'できる' && <MultiSelectButtons label="掲載媒体" options={['東海ナイツ', 'オフィシャルサイト', '案内所', '看板写真']} selectedValues={form.shootingDetail} onToggle={(v) => toggleMulti('shootingDetail', v)} />}
            <View style={styles.row}>
              <SelectButtons label="バースデー" options={['ある', 'ない']} selectedValue={form.birthdayWill} onSelect={(v) => updateField('birthdayWill', v)} />
              <View style={{width:10}}/><SelectButtons label="同伴・アフター" options={['できる', 'できない']} selectedValue={form.accompaniment} onSelect={(v) => updateField('accompaniment', v)} />
            </View>
            <SelectButtons label="借金" options={['ある', 'ない']} selectedValue={form.debt} onSelect={(v) => updateField('debt', v)} />
            {form.debt === 'ある' && <InputField label="詳細" placeholder="金額等" value={form.debtDetail} onChangeText={(v) => updateField('debtDetail', v)} />}
            <SelectButtons label="持病" options={['ある', 'ない']} selectedValue={form.illness} onSelect={(v) => updateField('illness', v)} />
            {form.illness === 'ある' && <InputField label="詳細" value={form.illnessDetail} onChangeText={(v) => updateField('illnessDetail', v)} />}
            <SelectButtons label="タトゥー・刺青" options={['ある', 'ない']} selectedValue={form.tattoo} onSelect={(v) => updateField('tattoo', v)} />
            {form.tattoo === 'ある' && <InputField label="部位・大きさ" value={form.tattooDetail} onChangeText={(v) => updateField('tattooDetail', v)} />}
            <MultiSelectButtons label="家族構成・パートナー" options={['独身', '夫がいる', 'こどもがいる']} selectedValues={form.familyStatus} onToggle={(v) => toggleMulti('familyStatus', v)} />
            <SelectButtons label="親・彼氏の承諾" options={['はい', 'いいえ']} selectedValue={form.familyApproval} onSelect={(v) => updateField('familyApproval', v)} />
          </Section>

          <Section title="緊急連絡先">
            <View style={styles.row}>
              <InputField label="ご氏名" placeholder="山田 太郎" required value={form.emName} onChangeText={(v) => updateField('emName', v)} error={errors.emName} flex={2} />
              <View style={{width:10}}/><InputField label="続柄" placeholder="父" required value={form.emRelation} onChangeText={(v) => updateField('emRelation', v)} error={errors.emRelation} flex={1} />
            </View>
            <InputField label="電話番号" placeholder="08012345678" required keyboardType="phone-pad" value={form.emPhone} onChangeText={(v) => updateField('emPhone', v)} error={errors.emPhone} />
            <InputField label="住所" multiline required placeholder="東京都..." value={form.emAddress} onChangeText={(v) => updateField('emAddress', v)} error={errors.emAddress} />
          </Section>

          <View style={styles.consentCard}><Text style={styles.consentText}>記入内容に事実に相違ない場合、チェックしてください</Text><Switch value={isAgreed} onValueChange={(v) => setIsAgreed(v)} trackColor={{ false: "#ccc", true: "#FF77A9" }} /></View>
          <TouchableOpacity style={[styles.submitButton, (!isAgreed || isSubmitting) && styles.submitButtonDisabled]} onPress={handleViewSubmit} disabled={!isAgreed || isSubmitting}>
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>内容を確認して送信</Text>}
          </TouchableOpacity>
          {submitError !== "" && <View style={styles.errorBanner}><Text style={styles.errorBannerText}>{submitError}</Text></View>}
          {isSent && <View style={styles.sentBanner}><Text style={styles.sentTextOnly}>送信されました。ありがとうございます！</Text></View>}
          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF0F5' },
  header: { 
    paddingVertical: 20, 
    backgroundColor: '#FFF0F5', // 背景色と同じピンクに変更
    alignItems: 'center', 
    // borderBottomWidth: 1, // 下線を消す場合はコメントアウト
    // borderBottomColor: '#EEE' 
  },
  headerTitle: { 
    ...fontSettings, 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#ff69b4' // 文字色を白に変更
  },
  scrollView: { flex: 1 },
  content: { padding: 16 },
  section: { marginBottom: 30, backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  sectionTitle: { ...fontSettings, fontSize: 17, fontWeight: 'bold', color: '#FF77A9', marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#FF77A9', paddingLeft: 10 },
  sectionDescription: { ...fontSettings, fontSize: 11, color: '#888', marginBottom: 16 },
  inputContainer: { marginBottom: 14 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  label: { ...fontSettings, fontSize: 13, color: '#333', fontWeight: 'bold' },
  requiredTag: { ...fontSettings, fontSize: 10, color: '#fff', backgroundColor: '#FF3B30', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, marginLeft: 8, overflow: 'hidden' },
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
  sentBanner: { marginTop: 15, alignItems: 'center' },
  sentTextOnly: { ...fontSettings, color: '#FF3B30', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
});
