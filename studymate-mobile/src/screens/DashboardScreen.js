import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  ImageBackground,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTasks } from '../api/taskApi';
import FadeInView, { ScalePressable, FloatingView } from '../components/FadeInView';
import { colors, spacing, borderRadius, cardShadow } from '../styles/theme';

const heroBg = require('../../assets/hero-bg.jpg');
const emptyImg = require('../../assets/empty-tasks.jpg');

const formatDate = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');

const getDueTag = (dueDate, completed) => {
  if (completed || !dueDate) return null;
  const today = new Date().toISOString().split('T')[0];
  const due = formatDate(dueDate);
  if (due < today) return { label: 'Overdue', color: colors.danger, bg: colors.dangerSoft };
  if (due === today) return { label: 'Due Today', color: colors.warning, bg: colors.warningSoft };
  return null;
};

const priorityStyle = (p) =>
  p === 'High'
    ? { color: colors.danger, bg: colors.dangerSoft }
    : p === 'Medium'
    ? { color: colors.warning, bg: colors.warningSoft }
    : { color: colors.accent, bg: colors.accentSoft };

export default function DashboardScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slowLoad, setSlowLoad] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Feature: 25-minute Focus Timer
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? (setTimerRunning(false), 0) : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const loadTasks = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setSlowLoad(false);
    const slowTimer = setTimeout(() => setSlowLoad(true), 4000);

    try {
      setError(null);
      setTasks(await getTasks());
    } catch (err) {
      setError(err.message || 'Could not connect to server.');
    } finally {
      clearTimeout(slowTimer);
      isFetchingRef.current = false;
      setLoading(false);
      setRefreshing(false);
      setSlowLoad(false);
    }
  };

  useFocusEffect(useCallback(() => { loadTasks(); }, []));

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const highPriority = tasks.filter((t) => t.priority === 'High' && !t.completed).length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const recentTasks = tasks.slice(0, 4);

  // Feature: Subject Breakdown (pending count per subject)
  const subjectMap = tasks.reduce((acc, t) => {
    if (!t.completed && t.subject) acc[t.subject] = (acc[t.subject] || 0) + 1;
    return acc;
  }, {});
  const subjects = Object.entries(subjectMap);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); loadTasks(); }}
          colors={[colors.accent]}
        />
      }
    >
      <FadeInView delay={0}>
        <View style={styles.header}>
          <Text style={styles.brand}>STUDYMATE</Text>
          <Text style={styles.title}>Student Dashboard</Text>
        </View>

        <View style={styles.actionRow}>
          <ScalePressable style={{ flex: 1 }} onPress={() => navigation.navigate('TaskForm')}>
            <View style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>+ Add Task</Text>
            </View>
          </ScalePressable>
          <ScalePressable style={{ flex: 1 }} onPress={() => navigation.navigate('MyTasks')}>
            <View style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>View All Tasks</Text>
            </View>
          </ScalePressable>
        </View>
      </FadeInView>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => { setLoading(true); loadTasks(); }}>
            <Text style={styles.retryText}>Tap to Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>
            {slowLoad ? 'Waking up server... First load can take 20–30s.' : 'Loading tasks...'}
          </Text>
        </View>
      ) : (
        <>
          {/* Hero Progress Card with Background Image */}
          <FadeInView delay={60}>
            <ImageBackground source={heroBg} style={styles.heroCard} imageStyle={styles.heroImg}>
              <View style={styles.heroOverlay}>
                <View style={styles.rowBetween}>
                  <Text style={styles.progressTitle}>Overall Progress</Text>
                  <Text style={styles.progressPct}>{progress}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
                </View>
                <Text style={styles.progressSub}>{completed} of {total} assignments completed</Text>
              </View>
            </ImageBackground>
          </FadeInView>

          {/* Focus Sprint Timer */}
          <FadeInView delay={100}>
            <View style={styles.timerCard}>
              <View>
                <Text style={styles.timerLabel}>FOCUS SPRINT</Text>
                <Text style={styles.timerClock}>{mins}:{secs}</Text>
              </View>
              <View style={styles.timerBtns}>
                <TouchableOpacity
                  style={[styles.timerBtn, timerRunning ? styles.timerPause : styles.timerStart]}
                  onPress={() => setTimerRunning((r) => !r)}
                >
                  <Text style={styles.timerBtnText}>{timerRunning ? 'Pause' : 'Start'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timerReset}
                  onPress={() => { setTimerRunning(false); setSecondsLeft(25 * 60); }}
                >
                  <Text style={styles.timerResetText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          </FadeInView>

          {/* Stats Grid */}
          <FadeInView delay={140}>
            <View style={styles.statsGrid}>
              {[
                { label: 'Total', value: total, color: colors.primary },
                { label: 'Pending', value: pending, color: colors.warning },
                { label: 'Completed', value: completed, color: colors.success },
                { label: 'High Priority', value: highPriority, color: colors.danger },
              ].map((s) => (
                <View key={s.label} style={styles.statCard}>
                  <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </FadeInView>

          {/* Subject Breakdown Pills */}
          {subjects.length > 0 && (
            <FadeInView delay={170}>
              <Text style={styles.sectionTitle}>Subjects Pending</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectScroll}>
                {subjects.map(([name, count]) => (
                  <TouchableOpacity
                    key={name}
                    style={styles.subjectPill}
                    onPress={() => navigation.navigate('MyTasks', { initialSearch: name })}
                  >
                    <Text style={styles.subjectPillText}>{name} · {count}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </FadeInView>
          )}

          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Recent Tasks</Text>
            {total > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('MyTasks')}>
                <Text style={styles.seeAll}>See all ({total})</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentTasks.length === 0 ? (
            <FadeInView delay={190}>
              <View style={styles.emptyCard}>
                <FloatingView>
                  <Image source={emptyImg} style={styles.emptyImage} />
                </FloatingView>
                <Text style={styles.emptyTitle}>No assignments yet</Text>
                <Text style={styles.emptySub}>Tap "+ Add Task" above to create your first task.</Text>
              </View>
            </FadeInView>
          ) : (
            recentTasks.map((task, idx) => {
              const dueTag = getDueTag(task.dueDate, task.completed);
              const pStyle = priorityStyle(task.priority);
              return (
                <FadeInView key={task._id} delay={190 + idx * 55}>
                  <ScalePressable onPress={() => navigation.navigate('TaskDetails', { taskId: task._id })}>
                    <View style={[styles.taskCard, { borderLeftColor: pStyle.color }]}>
                      <View style={styles.rowBetween}>
                        <Text style={styles.subject}>{task.subject}</Text>
                        <View style={styles.badgeRow}>
                          {dueTag && (
                            <View style={[styles.pill, { backgroundColor: dueTag.bg }]}>
                              <Text style={[styles.pillText, { color: dueTag.color }]}>{dueTag.label}</Text>
                            </View>
                          )}
                          <View style={[styles.pill, { backgroundColor: pStyle.bg }]}>
                            <Text style={[styles.pillText, { color: pStyle.color }]}>{task.priority}</Text>
                          </View>
                        </View>
                      </View>
                      <Text style={[styles.taskTitle, task.completed && styles.strike]}>{task.title}</Text>
                      <View style={styles.rowBetween}>
                        <Text style={styles.dueText}>Due: {formatDate(task.dueDate)}</Text>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: task.completed ? colors.success : colors.warning }}>
                          {task.completed ? '✓ Completed' : '• Pending'}
                        </Text>
                      </View>
                    </View>
                  </ScalePressable>
                </FadeInView>
              );
            })
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  header: { marginBottom: spacing.md },
  brand: { fontSize: 11, fontWeight: '800', color: colors.accent, letterSpacing: 1.6 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  primaryBtn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: borderRadius.md, alignItems: 'center', ...cardShadow },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  secondaryBtn: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingVertical: 14, borderRadius: borderRadius.md, alignItems: 'center', ...cardShadow },
  secondaryBtnText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  heroCard: { borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.md, ...cardShadow },
  heroImg: { borderRadius: borderRadius.lg },
  heroOverlay: { padding: spacing.md, backgroundColor: 'rgba(24, 24, 27, 0.35)' },
  progressTitle: { color: '#E4E4E7', fontSize: 13, fontWeight: '600' },
  progressPct: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  progressTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: borderRadius.full, marginVertical: spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#34D399', borderRadius: borderRadius.full },
  progressSub: { color: '#E4E4E7', fontSize: 12 },
  timerCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, ...cardShadow },
  timerLabel: { fontSize: 10, fontWeight: '800', color: colors.teal, letterSpacing: 1.2 },
  timerClock: { fontSize: 26, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  timerBtns: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  timerBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: borderRadius.full },
  timerStart: { backgroundColor: colors.teal },
  timerPause: { backgroundColor: colors.warning },
  timerBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  timerReset: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: borderRadius.full, backgroundColor: colors.surface },
  timerResetText: { color: colors.textSecondary, fontWeight: '700', fontSize: 13 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: spacing.sm },
  statCard: { width: '48.5%', backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, ...cardShadow },
  statNum: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontWeight: '600' },
  subjectScroll: { marginBottom: spacing.md },
  subjectPill: { backgroundColor: colors.tealSoft, paddingHorizontal: 14, paddingVertical: 8, borderRadius: borderRadius.full, marginRight: 8 },
  subjectPillText: { color: colors.teal, fontWeight: '700', fontSize: 13 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  seeAll: { color: colors.accent, fontSize: 13, fontWeight: '700', marginBottom: spacing.sm },
  taskCard: { backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4, ...cardShadow },
  subject: { fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', fontWeight: '700', letterSpacing: 0.8 },
  badgeRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.full },
  pillText: { fontSize: 11, fontWeight: '700' },
  taskTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginVertical: 6 },
  strike: { textDecorationLine: 'line-through', color: colors.textSecondary },
  dueText: { fontSize: 12, color: colors.textSecondary },
  emptyCard: { backgroundColor: colors.card, padding: spacing.lg, borderRadius: borderRadius.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.border, ...cardShadow },
  emptyImage: { width: 130, height: 130, borderRadius: borderRadius.md, marginBottom: spacing.sm },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  emptySub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
  centerBox: { padding: spacing.xl, alignItems: 'center' },
  loadingText: { marginTop: spacing.sm, color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  errorBox: { backgroundColor: colors.dangerSoft, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.md, borderWidth: 1, borderColor: '#FECDD3' },
  errorText: { color: colors.danger, fontSize: 13, marginBottom: spacing.xs },
  retryText: { color: colors.danger, fontWeight: '700', fontSize: 13, textDecorationLine: 'underline' },
});
