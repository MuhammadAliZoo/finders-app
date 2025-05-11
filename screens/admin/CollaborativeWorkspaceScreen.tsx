import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList } from '../../navigation/types';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';

type CollaborativeWorkspaceScreenProps = {
  navigation: DrawerNavigationProp<RootStackParamList>;
};

type Task = {
  id: string;
  title: string;
  assignee: string;
  status: string;
  created_at: string;
};

type Message = {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: { username?: string };
  user?: string;
  time?: string;
};

type TaskCardProps = {
  key?: React.Key;
  task: Task;
  colors: any;
};

type MessageCardProps = {
  key?: React.Key;
  message: Message;
  colors: any;
};

interface TaskItemProps {
  task: Task;
  colors: any;
  key?: string;
}

interface MessageItemProps {
  message: Message;
  colors: any;
  key?: string;
}

const TaskItem = ({ task, colors }: TaskItemProps) => (
  <View style={[
    styles.taskCard,
    {
      backgroundColor: colors.card + 'CC',
      borderColor: colors.primary + '33',
      shadowColor: colors.primary,
      shadowOpacity: 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      marginBottom: 16,
      borderWidth: 1,
    },
  ]}>
    <View style={styles.taskHeader}>
      <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Ionicons
          name={
            task.status === 'Completed'
              ? 'checkmark-circle-outline'
              : task.status === 'In Progress'
              ? 'time-outline'
              : 'ellipse-outline'
          }
          size={18}
          color={
            task.status === 'Completed'
              ? '#4CAF50'
              : task.status === 'In Progress'
              ? '#FF9800'
              : colors.secondary
          }
        />
      <Text
        style={[
          styles.taskStatus,
          {
            color:
              task.status === 'Completed'
                ? '#4CAF50'
                : task.status === 'In Progress'
                  ? '#FF9800'
                  : colors.secondary,
          },
        ]}
      >
        {task.status}
      </Text>
    </View>
    </View>
    <Text style={[styles.taskAssignee, { color: colors.secondary, fontStyle: 'italic' }]}>Assigned to: {task.assignee}</Text>
  </View>
);

const MessageItem = ({ message, colors }: MessageItemProps) => (
  <View style={[
    styles.messageContainer,
    {
      backgroundColor: colors.card + 'CC',
      borderRadius: 16,
      padding: 12,
      marginBottom: 10,
      borderColor: colors.primary + '33',
      borderWidth: 1,
      shadowColor: colors.primary,
      shadowOpacity: 0.10,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
  ]}>
    <View style={styles.messageHeader}>
      <Text style={[styles.userName, { color: colors.primary, fontWeight: 'bold' }]}>{message.user}</Text>
      <Text style={[styles.messageTime, { color: colors.secondary, fontSize: 12 }]}>{message.time}</Text>
    </View>
    <Text style={[styles.messageText, { color: colors.text, fontSize: 15 }]}>{message.message}</Text>
  </View>
);

const CollaborativeWorkspaceScreen: React.FC<CollaborativeWorkspaceScreenProps> = ({
  navigation,
}) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [taskStatus, setTaskStatus] = useState('Pending');
  const [addingTask, setAddingTask] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [loadingTeams, setLoadingTeams] = useState(true);

  // Fetch teams on mount
  useEffect(() => {
    fetchTeams();
  }, [user?.id]);

  // Fetch team members and chat when team changes
  useEffect(() => {
    if (selectedTeam) {
      fetchTeamMembers(selectedTeam.id);
      fetchMessages(selectedTeam.id);
      fetchTasks(selectedTeam.id);
    }
  }, [selectedTeam]);

  // Fetch teams the user is a member of
  const fetchTeams = async () => {
    setLoadingTeams(true);
    const { data, error } = await supabase
      .from('teams')
      .select('*, team_members!inner(user_id)')
      .eq('team_members.user_id', user?.id);
    setLoadingTeams(false);
    if (!error && data) {
      setTeams(data);
      setSelectedTeam(data[0] || null);
    }
  };

  // Fetch team members
  const fetchTeamMembers = async (teamId: string) => {
    const { data, error } = await supabase
      .from('team_members')
      .select('*, profiles(username, email)')
      .eq('team_id', teamId);
    if (!error && data) setTeamMembers(data);
  };

  // Fetch tasks for the selected team
  const fetchTasks = async (teamId: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });
    if (!error && data) setTasks(data);
  };

  // Create a new team
  const createTeam = async () => {
    if (!newTeamName.trim() || !user?.id) {
      Alert.alert('Missing Info', 'Please enter a team name.');
      return;
    }
    const { data, error } = await supabase
      .from('teams')
      .insert([{ name: newTeamName, created_by: user.id }])
      .select();
    if (error) {
      Alert.alert('Error', 'Failed to create team: ' + error.message);
      return;
    }
    if (data && data[0]) {
      // Add creator as member
      const { error: memberError } = await supabase.from('team_members').insert([{ team_id: data[0].id, user_id: user.id, role: 'admin' }]);
      if (memberError) {
        Alert.alert('Error', 'Team created, but failed to add you as a member: ' + memberError.message);
      } else {
        Alert.alert('Success', 'Team created successfully!');
      }
      setShowCreateTeam(false);
      setNewTeamName('');
      fetchTeams();
    }
  };

  // Add a new task
  const addTask = async () => {
    if (!newTaskTitle.trim() || !newTaskAssignee.trim() || !taskStatus.trim() || !selectedTeam) return;
    setAddingTask(true);
    const { error } = await supabase.from('tasks').insert([
      { title: newTaskTitle, assignee: newTaskAssignee, status: taskStatus, team_id: selectedTeam.id },
    ]);
    setAddingTask(false);
    if (error) {
      Alert.alert('Error', 'Failed to add task. Please try again.');
    } else {
      setNewTaskTitle('');
      setNewTaskAssignee('');
      setTaskStatus('Pending');
      fetchTasks(selectedTeam.id);
    }
  };

  // Fetch messages for the selected team
  const fetchMessages = async (teamId: string) => {
    const { data, error } = await supabase
      .from('team_chat')
      .select('*, profiles(username)')
      .eq('team_id', teamId)
      .order('created_at', { ascending: true });
    if (!error && data) setMessages(data);
  };

  // Send message to team chat
  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.id || !selectedTeam) return;
    await supabase.from('team_chat').insert([
      { message: newMessage, user_id: user.id, team_id: selectedTeam.id },
    ]);
    setNewMessage('');
    fetchMessages(selectedTeam.id);
  };

  // UI: If no teams, show create team form
  if (loadingTeams) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}><ActivityIndicator color={colors.primary} size={32} /></View>;
  }
  if (!teams.length || showCreateTeam) {
  return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 16 }}>Create a Team</Text>
        <TextInput
          style={{ color: '#222', backgroundColor: '#f3f4f6', borderRadius: 12, padding: 12, width: 260, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#e5e7eb' }}
          placeholder="Team Name"
          placeholderTextColor="#aaa"
          value={newTeamName}
          onChangeText={setNewTeamName}
        />
        <TouchableOpacity style={{ backgroundColor: colors.primary, borderRadius: 12, padding: 12, width: 130, alignItems: 'center', marginBottom: 16 }} onPress={createTeam}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Create</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // UI: Main collaborative workspace
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Main Title */}
      <View style={{ alignItems: 'center', paddingTop: 32, paddingBottom: 16 }}>
        <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#222', letterSpacing: 0.5 }}>Collaborative Workspace</Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16, gap: 24 }}>
        {/* Active Tasks Section */}
        <View style={{ borderRadius: 20, backgroundColor: '#f8fafc', padding: 18, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, borderWidth: 1, borderColor: '#e5e7eb' }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 12 }}>Active Tasks</Text>
          {/* Add Task Form below the title */}
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 6, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
            <TextInput
              style={{ color: '#222', backgroundColor: 'transparent', flex: 1, fontSize: 15, paddingHorizontal: 8 }}
              placeholder="Task Title"
              placeholderTextColor="#aaa"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoCapitalize="sentences"
              returnKeyType="next"
            />
            <TextInput
              style={{ color: '#222', backgroundColor: 'transparent', flex: 1, fontSize: 15, paddingHorizontal: 8 }}
              placeholder="Assignee"
              placeholderTextColor="#aaa"
              value={newTaskAssignee}
              onChangeText={setNewTaskAssignee}
              autoCapitalize="words"
              returnKeyType="next"
            />
            <TextInput
              style={{ color: '#222', backgroundColor: 'transparent', width: 80, fontSize: 15, paddingHorizontal: 8 }}
              placeholder="Pending"
              placeholderTextColor="#aaa"
              value={taskStatus}
              onChangeText={setTaskStatus}
              autoCapitalize="words"
              returnKeyType="done"
            />
            <TouchableOpacity
              style={{ backgroundColor: (newTaskTitle && newTaskAssignee && taskStatus) ? colors.primary : colors.primary + '55', borderRadius: 10, padding: 8, marginLeft: 4, alignItems: 'center', justifyContent: 'center' }}
              onPress={addTask}
              disabled={addingTask || !newTaskTitle || !newTaskAssignee || !taskStatus}
            >
              {addingTask ? (
                <ActivityIndicator color="#fff" size={18} />
              ) : (
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>+</Text>
              )}
            </TouchableOpacity>
          </View>
          <View>
            {tasks.length === 0 ? (
              <Text style={{ color: '#aaa', fontStyle: 'italic', textAlign: 'center', marginVertical: 8 }}>No tasks yet.</Text>
            ) : (
              tasks.map(task => (
                <View key={task.id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ fontWeight: 'bold', color: '#222', fontSize: 16 }}>{task.title}</Text>
                    <Text style={{ color: task.status === 'Completed' ? '#4CAF50' : task.status === 'In Progress' ? '#FF9800' : '#888', fontWeight: 'bold', fontSize: 14 }}>{task.status}</Text>
                  </View>
                  <Text style={{ color: '#888', fontStyle: 'italic', fontSize: 14 }}>Assigned to: {task.assignee}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Team Chat Section */}
        <View style={{ borderRadius: 20, backgroundColor: '#f8fafc', padding: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, borderWidth: 1, borderColor: '#e5e7eb' }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 12 }}>Team Chat</Text>
          <View style={{ marginBottom: 16, minHeight: 40 }}>
            {messages.length === 0 ? (
              <Text style={{ color: '#aaa', fontStyle: 'italic', textAlign: 'center', marginVertical: 8 }}>No messages yet.</Text>
            ) : (
              messages.map(msg => (
                <View key={msg.id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 15 }}>{msg.profiles?.username || msg.user_id}</Text>
                    <Text style={{ color: '#888', fontSize: 12 }}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                  <Text style={{ color: '#222', fontSize: 15 }}>{msg.message}</Text>
                </View>
              ))
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 6, borderWidth: 1, borderColor: '#e5e7eb' }}>
            <TextInput
              style={{ color: '#222', backgroundColor: 'transparent', flex: 1, fontSize: 15, paddingHorizontal: 8 }}
              placeholder="Type your message..."
              placeholderTextColor="#aaa"
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <TouchableOpacity style={{ backgroundColor: colors.primary, borderRadius: 20, height: 40, width: 40, alignItems: 'center', justifyContent: 'center', marginLeft: 6 }} onPress={sendMessage}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 22 }}>{'>'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    borderRadius: 12,
    padding: 8,
  },
  chatContainer: {
    marginBottom: 16,
  },
  container: {
    flex: 1,
  } as ViewStyle,
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  } as ViewStyle,
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  } as TextStyle,
  input: {
    borderRadius: 8,
    flex: 1,
    height: 40,
    marginRight: 12,
    paddingHorizontal: 12,
  },
  inputContainer: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 12,
  },
  section: {
    borderRadius: 16,
    elevation: 3,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sendButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  taskAssignee: {
    fontSize: 14,
  },
  taskCard: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taskHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default CollaborativeWorkspaceScreen;
