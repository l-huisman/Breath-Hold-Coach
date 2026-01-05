import React, {useEffect, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ThemedText} from '@/components/themed-text';
import {ThemedView} from '@/components/themed-view';
import {TextInput} from '@/components/text-input';
import {OptionButton} from '@/components/option-button';
import {Button} from '@/components/button';
import {Icon} from '@/components/icon';
import {
    defaultPracticeMomentsAssistiveLearning,
    defaultPracticeMomentsNormalLearning,
    useUser,
} from '@/contexts/user-context';
import {Colors} from '@/constants/theme';

export default function ProfileScreen() {
    const {user, settings, updateUser, updateSettings, updatePreferences, isLoading} = useUser();

    // Local state for form inputs
    const [name, setName] = useState(user.name);
    const [dateOfBirth, setDateOfBirth] = useState(
        user.dateOfBirth ? formatDate(user.dateOfBirth) : ''
    );
    const [breathHoldGoal, setBreathHoldGoal] = useState(
        settings.breathHoldGoal.toString()
    );
    const [dailyGoal, setDailyGoal] = useState(settings.dailyGoal.toString());
    const [assistiveLearning, setAssistiveLearning] = useState<boolean | null>(
        user.assistiveLearning
    );
    const [isSaving, setIsSaving] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date>(new Date());

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
            if (event.type === 'set' && selectedDate) {
                setDateOfBirth(formatDate(selectedDate));
            }
        } else if (selectedDate) {
            setTempDate(selectedDate);
        }
    };

    const handleDateConfirm = () => {
        setDateOfBirth(formatDate(tempDate));
        setShowDatePicker(false);
    };

    const handleDateCancel = () => {
        setShowDatePicker(false);
    };

    // Update local state when context changes (e.g., after loading from storage)
    useEffect(() => {
        setName(user.name);
        setDateOfBirth(user.dateOfBirth ? formatDate(user.dateOfBirth) : '');
        setBreathHoldGoal(settings.breathHoldGoal.toString());
        setDailyGoal(settings.dailyGoal.toString());
        setAssistiveLearning(user.assistiveLearning);
    }, [user, settings]);

    const validateForm = (): {valid: boolean; trimmedName?: string; breathHoldValue?: number; dailyGoalValue?: number; parsedDate?: Date | null} => {
        // Validate name
        const trimmedName = name.trim();
        if (!trimmedName) {
            Alert.alert('Ongeldige waarde', 'Naam mag niet leeg zijn.');
            return {valid: false};
        }

        if (trimmedName.length < 2 || trimmedName.length > 100) {
            Alert.alert(
                'Ongeldige waarde',
                'Naam moet tussen 2 en 100 tekens lang zijn.'
            );
            return {valid: false};
        }

        // Validate breath hold goal
        const breathHoldValue = parseInt(breathHoldGoal, 10);
        if (isNaN(breathHoldValue) || breathHoldValue < 1 || breathHoldValue > 300) {
            Alert.alert(
                'Ongeldige waarde',
                'Ademhoud doel moet tussen 1 en 300 seconden zijn.'
            );
            return {valid: false};
        }

        // Validate daily goal
        const dailyGoalValue = parseInt(dailyGoal, 10);
        if (isNaN(dailyGoalValue) || dailyGoalValue < 1 || dailyGoalValue > 60) {
            Alert.alert(
                'Ongeldige waarde',
                'Dagelijks doel moet tussen 1 en 60 seconden zijn.'
            );
            return {valid: false};
        }

        // Parse and validate date if provided
        let parsedDate: Date | null = null;
        if (dateOfBirth) {
            parsedDate = parseDate(dateOfBirth);
            if (!parsedDate) {
                Alert.alert(
                    'Ongeldige datum',
                    'Gebruik het formaat DD-MM-JJJJ voor geboortedatum.'
                );
                return {valid: false};
            }

            // Validate date is reasonable
            const now = new Date();
            const age = now.getFullYear() - parsedDate.getFullYear();
            if (age < 0 || age > 150) {
                Alert.alert(
                    'Ongeldige datum',
                    'Geboortedatum moet tussen nu en 150 jaar geleden zijn.'
                );
                return {valid: false};
            }

            if (parsedDate > now) {
                Alert.alert(
                    'Ongeldige datum',
                    'Geboortedatum kan niet in de toekomst liggen.'
                );
                return {valid: false};
            }
        }

        return {valid: true, trimmedName, breathHoldValue, dailyGoalValue, parsedDate};
    };

    const handleSave = async () => {
        setIsSaving(true);

        try {
            const validation = validateForm();
            if (!validation.valid) {
                return;
            }

            const {trimmedName, breathHoldValue, dailyGoalValue, parsedDate} = validation;

            // Check if assistiveLearning changed - update practice moments accordingly
            const assistiveLearningChanged = assistiveLearning !== user.assistiveLearning;

            // Update context (all updates are now async and persist to AsyncStorage)
            await updateUser({
                name: trimmedName!,
                dateOfBirth: parsedDate ?? null,
                assistiveLearning,
            });

            await updateSettings({
                breathHoldGoal: breathHoldValue!,
                dailyGoal: dailyGoalValue!,
            });

            // Update practice moments if assistiveLearning changed
            if (assistiveLearningChanged && assistiveLearning !== null) {
                const newPracticeMoments = assistiveLearning
                    ? defaultPracticeMomentsAssistiveLearning
                    : defaultPracticeMomentsNormalLearning;

                await updatePreferences({
                    practiceMoments: newPracticeMoments,
                });
            }

            Alert.alert('Opgeslagen', 'Je profielgegevens zijn bijgewerkt.');
        } catch (error) {
            console.error('Failed to save profile:', error);
            Alert.alert(
                'Fout bij opslaan',
                'Er is iets misgegaan bij het opslaan van je gegevens. Probeer het opnieuw.'
            );
        } finally {
            setIsSaving(false);
        }
    };

    // Show loading indicator while loading from storage
    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ThemedView style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.light.primary}/>
                    <ThemedText style={styles.loadingText}>Gegevens laden...</ThemedText>
                </ThemedView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ThemedView style={styles.container}>
                    {/* Title */}
                    <ThemedText type="title" style={styles.title}>
                        Profiel
                    </ThemedText>

                    {/* Scrollable Content */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Personal Information Section */}
                        <View style={styles.section}>
                            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                                Persoonlijke Gegevens
                            </ThemedText>

                            <TextInput
                                label="Naam"
                                value={name}
                                onChangeText={setName}
                                placeholder="Vul je naam in"
                                icon={<Icon name="person.fill" size={24} color={Colors.light.text}/>}
                                autoCapitalize="words"
                                accessibilityLabel="Naam"
                                editable={!isSaving}
                            />

                            <TextInput
                                label="Geboortedatum"
                                value={dateOfBirth}
                                onChangeText={setDateOfBirth}
                                onPress={() => setShowDatePicker(true)}
                                placeholder="DD-MM-JJJJ"
                                icon={<Icon name="calendar" size={24} color={Colors.light.text}/>}
                                editable={false}
                                accessibilityLabel="Geboortedatum"
                                accessibilityHint="Tik om geboortedatum te selecteren"
                            />

                            {showDatePicker && (
                                <>
                                    {Platform.OS === 'ios' && (
                                        <View style={styles.datePickerModal}>
                                            <View style={styles.datePickerHeader}>
                                                <TouchableOpacity onPress={handleDateCancel}>
                                                    <ThemedText style={styles.datePickerButton}>Annuleren</ThemedText>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={handleDateConfirm}>
                                                    <ThemedText style={styles.datePickerButton}>Bevestigen</ThemedText>
                                                </TouchableOpacity>
                                            </View>
                                            <DateTimePicker
                                                value={tempDate}
                                                mode="date"
                                                display="spinner"
                                                onChange={handleDateChange}
                                                maximumDate={new Date()}
                                                minimumDate={new Date(1874, 0, 1)}
                                                accessibilityLabel="Selecteer geboortedatum"
                                            />
                                        </View>
                                    )}
                                    {Platform.OS === 'android' && (
                                        <DateTimePicker
                                            value={tempDate}
                                            mode="date"
                                            display="default"
                                            onChange={handleDateChange}
                                            maximumDate={new Date()}
                                            minimumDate={new Date(1874, 0, 1)}
                                            accessibilityLabel="Selecteer geboortedatum"
                                        />
                                    )}
                                </>
                            )}

                            <TextInput
                                label="Patiëntnummer"
                                value={maskPatientNumber(user.patientNumber)}
                                onChangeText={() => {
                                }}
                                editable={false}
                                icon={<Icon name="info.circle.fill" size={24} color={Colors.light.text}/>}
                                accessibilityLabel="Patiëntnummer"
                                accessibilityHint="Patiëntnummer is niet aanpasbaar en deels verborgen voor privacy"
                            />
                        </View>


                        {/* Goal Settings Section */}
                        <View style={styles.section}>
                            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                                Doelinstellingen
                            </ThemedText>

                            <TextInput
                                label="Ademhoud doel (seconden)"
                                value={breathHoldGoal}
                                onChangeText={setBreathHoldGoal}
                                placeholder="45"
                                icon={<Icon name="target" size={24} color={Colors.light.text}/>}
                                keyboardType="numeric"
                                accessibilityLabel="Ademhoud doel in seconden"
                                editable={!isSaving}
                            />

                            <TextInput
                                label="Dagelijks doel (seconden)"
                                value={dailyGoal}
                                onChangeText={setDailyGoal}
                                placeholder="5"
                                icon={<Icon name="checkmark" size={24} color={Colors.light.text}/>}
                                keyboardType="numeric"
                                accessibilityLabel="Dagelijks doel in seconden"
                                editable={!isSaving}
                            />
                        </View>

                        {/* Learning Mode Section */}
                        <View style={styles.section}>
                            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                                Leermodus
                            </ThemedText>
                            <ThemedText style={styles.sectionDescription}>
                                Kies de begeleiding die bij je past
                            </ThemedText>

                            <OptionButton
                                title="Heb je last van longklachten?"
                                description={["Bijvoorbeeld bij astma of langdurig roken.", "De app begeleidt je in kleinere stappen met extra oefenmomenten."]}
                                selected={assistiveLearning === true}
                                onPress={() => setAssistiveLearning(true)}
                                disabled={isSaving}
                            />

                            <OptionButton
                                title="Ik heb geen longklachten"
                                description="De app begeleidt je in grotere stappen met minder oefenmomenten."
                                selected={assistiveLearning === false}
                                onPress={() => setAssistiveLearning(false)}
                                disabled={isSaving}
                            />
                        </View>

                        {/* Spacer */}
                        <View style={styles.spacer}/>
                    </ScrollView>

                    {/* Save Button */}
                    <View style={styles.buttonContainer}>
                        <Button onPress={handleSave} disabled={isSaving}>
                            {isSaving ? 'Opslaan...' : 'Opslaan'}
                        </Button>
                    </View>
                </ThemedView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// Helper function to mask patient number for privacy (show last 3 digits)function maskPatientNumber(patientNumber: string): string {
function maskPatientNumber(patientNumber: string): string {
    if (!patientNumber) return '';

    // Always show last 3 digits, mask everything else
    const visibleCount = Math.min(3, patientNumber.length);
    const lastDigits = patientNumber.slice(-visibleCount);
    const maskedCount = Math.max(0, patientNumber.length - visibleCount);
    const masked = '*'.repeat(maskedCount);

    return masked + lastDigits;
}

// Helper function to format date to DD-MM-YYYY
function formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

// Helper function to parse DD-MM-YYYY to Date
function parseDate(dateString: string): Date | null {
    const parts = dateString.split('-');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) {
        return null;
    }

    const date = new Date(year, month, day);
    // Verify the date is valid
    if (
        date.getDate() !== day ||
        date.getMonth() !== month ||
        date.getFullYear() !== year
    ) {
        return null;
    }

    return date;
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        color: Colors.light.textMuted,
    },
    title: {
        textAlign: 'center',
        marginBottom: 20,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        gap: 32,
        paddingBottom: 20,
    },
    section: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 20,
        marginBottom: 4,
    },
    sectionDescription: {
        fontSize: 14,
        color: Colors.light.text,
        marginBottom: 8,
    },
    spacer: {
        flex: 1,
        minHeight: 20,
    },
    buttonContainer: {
        paddingVertical: 20,
    },
    datePickerModal: {
        backgroundColor: Colors.light.background,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
    },
    datePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    datePickerButton: {
        color: Colors.light.primary,
        fontSize: 16
    }
});