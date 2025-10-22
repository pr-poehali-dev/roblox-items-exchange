import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Listing {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  seller: string;
}

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  isOwn: boolean;
  replyTo?: { id: number; text: string; sender: string };
}

interface Chat {
  id: string;
  participant: string;
  participantAvatar?: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: Message[];
  blocked: boolean;
}

interface User {
  username: string;
  avatar?: string;
  rating: number;
  deals: number;
  reports: number;
  isBlocked: boolean;
}

interface StoredData {
  users: Record<string, { password: string; user: User }>;
  listings: Listing[];
  chats: Record<string, Chat>;
}

const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKnl8bllHgU2';

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('listings');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteListingId, setDeleteListingId] = useState<number | null>(null);
  const [reportTarget, setReportTarget] = useState<string>('');
  const [reportReason, setReportReason] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [chatMessage, setChatMessage] = useState('');
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [profileAvatar, setProfileAvatar] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [authForm, setAuthForm] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    imageUrl: ''
  });

  const [listings, setListings] = useState<Listing[]>([]);
  const [chats, setChats] = useState<Record<string, Chat>>({});
  const [users, setUsers] = useState<Record<string, { password: string; user: User }>>({});

  useEffect(() => {
    const audio = new Audio(NOTIFICATION_SOUND);
    audioRef.current = audio;
    
    const stored = localStorage.getItem('rotrade_data');
    if (stored) {
      const data: StoredData = JSON.parse(stored);
      setUsers(data.users || {});
      setListings(data.listings || []);
      setChats(data.chats || {});
    } else {
      const defaultUsers = {
        'TraderPro': {
          password: 'demo123',
          user: { username: 'TraderPro', rating: 4.8, deals: 24, reports: 0, isBlocked: false }
        }
      };
      const defaultListings = [{
        id: 1,
        title: 'Dominus Empyreus',
        description: 'Редкая шапка, отличное состояние. Обсудим цену в личных сообщениях',
        imageUrl: '/placeholder.svg',
        seller: 'TraderPro'
      }];
      setUsers(defaultUsers);
      setListings(defaultListings);
      saveToStorage({ users: defaultUsers, listings: defaultListings, chats: {} });
    }

    const currentUserData = localStorage.getItem('rotrade_current_user');
    if (currentUserData) {
      const userData = JSON.parse(currentUserData);
      setCurrentUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const saveToStorage = (data: Partial<StoredData>) => {
    const stored = localStorage.getItem('rotrade_data');
    const current: StoredData = stored ? JSON.parse(stored) : { users: {}, listings: [], chats: {} };
    const updated = { ...current, ...data };
    localStorage.setItem('rotrade_data', JSON.stringify(updated));
  };

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleAuth = () => {
    if (authMode === 'register') {
      if (!authForm.username || !authForm.password || !authForm.confirmPassword) {
        toast({ title: "Ошибка", description: "Заполните все поля", variant: "destructive" });
        return;
      }
      if (authForm.password !== authForm.confirmPassword) {
        toast({ title: "Ошибка", description: "Пароли не совпадают", variant: "destructive" });
        return;
      }
      if (users[authForm.username]) {
        toast({ title: "Ошибка", description: "Это имя уже занято", variant: "destructive" });
        return;
      }

      const newUser: User = {
        username: authForm.username,
        rating: 0,
        deals: 0,
        reports: 0,
        isBlocked: false
      };
      
      const updatedUsers = {
        ...users,
        [authForm.username]: { password: authForm.password, user: newUser }
      };
      
      setUsers(updatedUsers);
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      saveToStorage({ users: updatedUsers });
      localStorage.setItem('rotrade_current_user', JSON.stringify(newUser));
      
      toast({ title: "Успех!", description: "Регистрация завершена" });
    } else {
      if (!authForm.username || !authForm.password) {
        toast({ title: "Ошибка", description: "Заполните все поля", variant: "destructive" });
        return;
      }
      
      const userData = users[authForm.username];
      if (!userData || userData.password !== authForm.password) {
        toast({ title: "Ошибка", description: "Неверный логин или пароль", variant: "destructive" });
        return;
      }
      
      if (userData.user.isBlocked) {
        toast({ title: "Ошибка", description: "Ваш профиль заблокирован", variant: "destructive" });
        return;
      }

      setCurrentUser(userData.user);
      setIsAuthenticated(true);
      localStorage.setItem('rotrade_current_user', JSON.stringify(userData.user));
      toast({ title: "Успех!", description: "Вы вошли в систему" });
    }
    
    setShowAuthDialog(false);
    setAuthForm({ username: '', password: '', confirmPassword: '' });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('rotrade_current_user');
    toast({ title: "Выход", description: "Вы вышли из системы" });
  };

  const handleCreateListing = () => {
    if (!isAuthenticated || !currentUser) {
      toast({ title: "Ошибка", description: "Войдите в систему", variant: "destructive" });
      setShowAuthDialog(true);
      return;
    }
    if (!newListing.title || !newListing.description) {
      toast({ title: "Ошибка", description: "Заполните название и описание", variant: "destructive" });
      return;
    }

    const listing: Listing = {
      id: Date.now(),
      title: newListing.title,
      description: newListing.description,
      imageUrl: newListing.imageUrl || '/placeholder.svg',
      seller: currentUser.username
    };

    const updatedListings = [listing, ...listings];
    setListings(updatedListings);
    saveToStorage({ listings: updatedListings });
    setNewListing({ title: '', description: '', imageUrl: '' });
    setActiveTab('listings');
    toast({ title: "Готово!", description: "Объявление создано" });
  };

  const handleDeleteListing = (id: number) => {
    const updatedListings = listings.filter(l => l.id !== id);
    setListings(updatedListings);
    saveToStorage({ listings: updatedListings });
    toast({ title: "Удалено", description: "Объявление удалено" });
    setShowDeleteDialog(false);
  };

  const handleOpenChat = (participant: string) => {
    if (!isAuthenticated || !currentUser) {
      toast({ title: "Ошибка", description: "Войдите для связи с продавцом", variant: "destructive" });
      setShowAuthDialog(true);
      return;
    }

    const chatId = [currentUser.username, participant].sort().join('_');
    
    if (!chats[chatId]) {
      const newChat: Chat = {
        id: chatId,
        participant: participant,
        participantAvatar: users[participant]?.user.avatar,
        lastMessage: 'Начните диалог',
        lastTime: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        unread: 0,
        messages: [],
        blocked: false
      };
      const updatedChats = { ...chats, [chatId]: newChat };
      setChats(updatedChats);
      saveToStorage({ chats: updatedChats });
    }

    setActiveChatId(chatId);
    setShowChat(true);
    
    const updatedChats = { ...chats };
    if (updatedChats[chatId]) {
      updatedChats[chatId].unread = 0;
      setChats(updatedChats);
      saveToStorage({ chats: updatedChats });
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !currentUser) return;
    
    const chat = chats[activeChatId];
    if (!chat || chat.blocked) {
      toast({ title: "Ошибка", description: "Чат заблокирован", variant: "destructive" });
      return;
    }

    const newMessage: Message = {
      id: Date.now(),
      sender: currentUser.username,
      text: chatMessage,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      replyTo: replyToMessage ? {
        id: replyToMessage.id,
        text: replyToMessage.text,
        sender: replyToMessage.sender
      } : undefined
    };

    const updatedChat = {
      ...chat,
      messages: [...chat.messages, newMessage],
      lastMessage: chatMessage,
      lastTime: newMessage.time
    };

    const updatedChats = { ...chats, [activeChatId]: updatedChat };
    setChats(updatedChats);
    saveToStorage({ chats: updatedChats });
    
    setChatMessage('');
    setReplyToMessage(null);
  };

  const handleBlockChat = () => {
    if (!activeChatId) return;
    
    const updatedChat = { ...chats[activeChatId], blocked: !chats[activeChatId].blocked };
    const updatedChats = { ...chats, [activeChatId]: updatedChat };
    setChats(updatedChats);
    saveToStorage({ chats: updatedChats });
    
    toast({
      title: updatedChat.blocked ? "Заблокировано" : "Разблокировано",
      description: updatedChat.blocked ? "Пользователь заблокирован" : "Пользователь разблокирован"
    });
  };

  const handleReport = () => {
    if (!reportReason.trim()) {
      toast({ title: "Ошибка", description: "Укажите причину жалобы", variant: "destructive" });
      return;
    }

    const targetUserData = users[reportTarget];
    if (!targetUserData) return;

    const updatedUser = {
      ...targetUserData.user,
      reports: targetUserData.user.reports + 1,
      isBlocked: targetUserData.user.reports + 1 >= 5
    };

    const updatedUsers = {
      ...users,
      [reportTarget]: { ...targetUserData, user: updatedUser }
    };

    setUsers(updatedUsers);
    saveToStorage({ users: updatedUsers });

    if (updatedUser.isBlocked) {
      toast({
        title: "Профиль заблокирован",
        description: "Пользователь заблокирован за множественные нарушения",
        variant: "destructive"
      });
    } else {
      toast({ title: "Отправлено", description: "Жалоба отправлена администрации" });
    }

    setShowReportDialog(false);
    setReportReason('');
  };

  const handleUpdateProfile = () => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, avatar: profileAvatar };
    setCurrentUser(updatedUser);

    const updatedUsers = {
      ...users,
      [currentUser.username]: {
        ...users[currentUser.username],
        user: updatedUser
      }
    };

    setUsers(updatedUsers);
    saveToStorage({ users: updatedUsers });
    localStorage.setItem('rotrade_current_user', JSON.stringify(updatedUser));

    toast({ title: "Сохранено", description: "Профиль обновлён" });
    setShowProfileSettings(false);
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userChats = Object.values(chats).filter(chat =>
    chat.id.includes(currentUser?.username || '')
  );

  const totalUnread = userChats.reduce((sum, chat) => sum + chat.unread, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Package" className="text-primary-foreground" size={20} />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">RoTrade</h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('listings')}>
                <Icon name="Store" size={18} className="mr-2" />
                Объявления
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('chats')}>
                <Icon name="MessageCircle" size={18} className="mr-2" />
                Чаты
                {totalUnread > 0 && (
                  <Badge variant="destructive" className="ml-2 px-1.5 py-0 text-xs">{totalUnread}</Badge>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('create')}>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('profile')}>
                <Icon name="User" size={18} className="mr-2" />
                Профиль
              </Button>
            </nav>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8 md:w-9 md:h-9 cursor-pointer" onClick={() => setShowProfileSettings(true)}>
                  {currentUser?.avatar ? (
                    <AvatarImage src={currentUser.avatar} />
                  ) : (
                    <AvatarFallback>{currentUser?.username[0]}</AvatarFallback>
                  )}
                </Avatar>
                <Button variant="outline" size="sm" onClick={handleLogout} className="hidden md:flex">
                  <Icon name="LogOut" size={16} className="mr-2" />
                  Выйти
                </Button>
              </div>
            ) : (
              <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => {
                setAuthMode('login');
                setShowAuthDialog(true);
              }}>
                <Icon name="LogIn" size={16} className="mr-2" />
                Войти
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 md:hidden mb-6">
            <TabsTrigger value="listings">
              <Icon name="Store" size={16} />
            </TabsTrigger>
            <TabsTrigger value="chats" className="relative">
              <Icon name="MessageCircle" size={16} />
              {totalUnread > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px]">
                  {totalUnread}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="create">
              <Icon name="Plus" size={16} />
            </TabsTrigger>
            <TabsTrigger value="profile">
              <Icon name="User" size={16} />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">Объявления</h2>
                  <p className="text-sm md:text-base text-muted-foreground">Найдите лучшие предложения по вещам Roblox</p>
                </div>
                <div className="w-full md:w-96">
                  <div className="relative">
                    <Icon name="Search" className="absolute left-3 top-3 text-muted-foreground" size={18} />
                    <Input
                      placeholder="Поиск..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredListings.map((listing) => (
                  <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="p-0">
                      <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
                        <img
                          src={listing.imageUrl}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-base md:text-lg">{listing.title}</CardTitle>
                      </div>
                      <CardDescription className="line-clamp-2 mb-3 text-sm">
                        {listing.description}
                      </CardDescription>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon name="User" size={14} />
                        {listing.seller}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex gap-2">
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary/90"
                        size="sm"
                        onClick={() => handleOpenChat(listing.seller)}
                      >
                        <Icon name="MessageCircle" size={16} className="mr-2" />
                        Связаться
                      </Button>
                      {currentUser?.username === listing.seller && (
                        <Button 
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setDeleteListingId(listing.id);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {filteredListings.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Объявления не найдены</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="chats" className="space-y-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Чаты</h2>
              <p className="text-sm md:text-base text-muted-foreground mb-4">Ваши диалоги с продавцами и покупателями</p>
            </div>

            {!isAuthenticated ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Icon name="MessageCircle" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Войдите чтобы видеть чаты</p>
                  <Button onClick={() => {
                    setAuthMode('login');
                    setShowAuthDialog(true);
                  }}>
                    Войти
                  </Button>
                </CardContent>
              </Card>
            ) : userChats.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Icon name="MessageCircle" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">У вас пока нет чатов</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {userChats.map((chat) => (
                  <Card
                    key={chat.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => {
                      setActiveChatId(chat.id);
                      setShowChat(true);
                      const updatedChats = { ...chats };
                      updatedChats[chat.id].unread = 0;
                      setChats(updatedChats);
                      saveToStorage({ chats: updatedChats });
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 md:w-12 md:h-12">
                          {chat.participantAvatar ? (
                            <AvatarImage src={chat.participantAvatar} />
                          ) : (
                            <AvatarFallback>{chat.participant[0]}</AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold truncate">{chat.participant}</h3>
                            <span className="text-xs text-muted-foreground">{chat.lastTime}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground truncate flex-1">{chat.lastMessage}</p>
                            {chat.unread > 0 && (
                              <Badge variant="default" className="ml-2">{chat.unread}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl">Создать объявление</CardTitle>
                  <CardDescription className="text-sm">
                    Заполните информацию о вашем предложении
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Название вещи *</Label>
                    <Input
                      id="title"
                      placeholder="Dominus Empyreus"
                      value={newListing.title}
                      onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Описание *</Label>
                    <Textarea
                      id="description"
                      placeholder="Опишите предмет, его состояние. Цену обсудим в чате..."
                      rows={4}
                      value={newListing.description}
                      onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 Не указывайте цену в объявлении - обсудите её с покупателем в личных сообщениях
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Ссылка на изображение</Label>
                    <Input
                      id="imageUrl"
                      placeholder="https://example.com/image.jpg"
                      value={newListing.imageUrl}
                      onChange={(e) => setNewListing({ ...newListing, imageUrl: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Загрузите изображение на любой хостинг и вставьте ссылку
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleCreateListing} className="w-full bg-primary hover:bg-primary/90">
                    <Icon name="Check" size={18} className="mr-2" />
                    Опубликовать объявление
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              {!isAuthenticated ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Icon name="User" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Войдите чтобы видеть профиль</p>
                    <Button onClick={() => {
                      setAuthMode('login');
                      setShowAuthDialog(true);
                    }}>
                      Войти
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <Avatar className="w-16 h-16 md:w-20 md:h-20">
                        {currentUser?.avatar ? (
                          <AvatarImage src={currentUser.avatar} />
                        ) : (
                          <AvatarFallback className="text-2xl">{currentUser?.username[0]}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 text-center md:text-left">
                        <CardTitle className="text-xl md:text-2xl">{currentUser?.username}</CardTitle>
                        <CardDescription>Участник с {new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</CardDescription>
                        <div className="flex flex-wrap items-center gap-2 mt-2 justify-center md:justify-start">
                          {currentUser && currentUser.rating > 0 && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Icon name="Star" size={12} />
                              {currentUser.rating.toFixed(1)}
                            </Badge>
                          )}
                          {currentUser && currentUser.deals > 0 && (
                            <Badge>Сделок: {currentUser.deals}</Badge>
                          )}
                        </div>
                      </div>
                      <Button onClick={() => {
                        setProfileAvatar(currentUser?.avatar || '');
                        setShowProfileSettings(true);
                      }}>
                        <Icon name="Settings" size={16} className="mr-2" />
                        Настройки
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="space-y-1">
                        <div className="text-xl md:text-2xl font-bold text-primary">{listings.filter(l => l.seller === currentUser?.username).length}</div>
                        <div className="text-xs md:text-sm text-muted-foreground">Объявлений</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xl md:text-2xl font-bold text-primary">{userChats.length}</div>
                        <div className="text-xs md:text-sm text-muted-foreground">Чатов</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xl md:text-2xl font-bold text-primary">{currentUser?.deals || 0}</div>
                        <div className="text-xs md:text-sm text-muted-foreground">Сделок</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t mt-8 md:mt-16 py-6 md:py-8 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Package" className="text-primary-foreground" size={20} />
              </div>
              <span className="font-bold text-lg">RoTrade</span>
            </div>
            
            <div className="flex gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">О проекте</a>
              <a href="#" className="hover:text-foreground transition-colors">Правила</a>
              <a href="#" className="hover:text-foreground transition-colors">Поддержка</a>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t text-center">
            <div className="flex items-center justify-center gap-2 text-destructive font-medium mb-2">
              <Icon name="AlertTriangle" size={18} />
              <span className="text-sm md:text-base">ВАЖНО</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto">
              САЙТ НЕ РУЧАЕТСЯ ЗА СДЕЛКИ. Все транзакции происходят между пользователями напрямую. 
              Администрация платформы не несёт ответственности за качество товаров и честность сделок.
              Будьте внимательны и осторожны при проведении операций.
            </p>
          </div>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            © 2024 RoTrade. Платформа для обмена игровыми предметами Roblox
          </div>
        </div>
      </footer>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>{authMode === 'login' ? 'Вход' : 'Регистрация'}</DialogTitle>
            <DialogDescription className="text-sm">
              {authMode === 'login' 
                ? 'Введите данные для входа в систему' 
                : 'Создайте аккаунт для размещения объявлений'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auth-username">Имя пользователя</Label>
              <Input
                id="auth-username"
                placeholder="TraderPro"
                value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-password">Пароль</Label>
              <Input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              />
            </div>
            {authMode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="auth-confirm">Подтвердите пароль</Label>
                <Input
                  id="auth-confirm"
                  type="password"
                  placeholder="••••••••"
                  value={authForm.confirmPassword}
                  onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                />
              </div>
            )}
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button 
              variant="ghost" 
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
              }}
              className="w-full sm:w-auto text-sm"
            >
              {authMode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
            </Button>
            <Button onClick={handleAuth} className="w-full sm:w-auto bg-primary">
              {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent className="w-[95vw] max-w-2xl h-[85vh] md:h-[600px] flex flex-col p-0">
          <DialogHeader className="p-4 md:p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  {chats[activeChatId]?.participantAvatar ? (
                    <AvatarImage src={chats[activeChatId].participantAvatar} />
                  ) : (
                    <AvatarFallback>{chats[activeChatId]?.participant[0]}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <DialogTitle className="text-base md:text-lg">{chats[activeChatId]?.participant}</DialogTitle>
                  <div className="text-xs text-muted-foreground font-normal">
                    {chats[activeChatId]?.blocked ? 'Заблокирован' : 'В сети'}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReportTarget(chats[activeChatId]?.participant || '');
                    setShowReportDialog(true);
                  }}
                >
                  <Icon name="Flag" size={16} />
                </Button>
                <Button
                  variant={chats[activeChatId]?.blocked ? "default" : "ghost"}
                  size="sm"
                  onClick={handleBlockChat}
                >
                  <Icon name={chats[activeChatId]?.blocked ? "Unlock" : "Ban"} size={16} />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-4 md:p-6">
            <div className="space-y-4">
              {chats[activeChatId]?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 md:gap-3 ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="w-7 h-7 md:w-8 md:h-8">
                    <AvatarFallback className="text-xs">{message.sender[0]}</AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col gap-1 max-w-[75%] md:max-w-[70%]`}>
                    {message.replyTo && (
                      <div className="text-xs bg-muted/50 p-2 rounded border-l-2 border-primary">
                        <div className="font-semibold">{message.replyTo.sender}</div>
                        <div className="truncate">{message.replyTo.text}</div>
                      </div>
                    )}
                    <div
                      className={`rounded-lg px-3 py-2 md:px-4 md:py-2 cursor-pointer ${
                        message.isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                      onClick={() => setReplyToMessage(message)}
                    >
                      <p className="text-sm break-words">{message.text}</p>
                    </div>
                    <span className="text-xs text-muted-foreground px-1">
                      {message.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-3 md:p-4 border-t">
            {replyToMessage && (
              <div className="bg-muted p-2 rounded mb-2 flex items-center justify-between text-sm">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs">{replyToMessage.sender}</div>
                  <div className="truncate text-xs">{replyToMessage.text}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyToMessage(null)}
                >
                  <Icon name="X" size={14} />
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Напишите сообщение..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={chats[activeChatId]?.blocked}
                className="text-sm"
              />
              <Button 
                onClick={handleSendMessage} 
                className="bg-primary"
                size="sm"
                disabled={chats[activeChatId]?.blocked}
              >
                <Icon name="Send" size={16} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ⚠️ Сделки происходят между пользователями. Будьте осторожны!
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showProfileSettings} onOpenChange={setShowProfileSettings}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Настройки профиля</DialogTitle>
            <DialogDescription className="text-sm">
              Измените настройки вашего профиля
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-avatar">Ссылка на аватар</Label>
              <Input
                id="profile-avatar"
                placeholder="https://example.com/avatar.jpg"
                value={profileAvatar}
                onChange={(e) => setProfileAvatar(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Загрузите изображение на любой хостинг и вставьте ссылку
              </p>
            </div>
            {profileAvatar && (
              <div className="flex justify-center">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profileAvatar} />
                  <AvatarFallback>{currentUser?.username[0]}</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateProfile} className="w-full bg-primary">
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Пожаловаться на пользователя</DialogTitle>
            <DialogDescription className="text-sm">
              Опишите причину жалобы. После 5 жалоб профиль будет заблокирован
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-reason">Причина жалобы</Label>
              <Textarea
                id="report-reason"
                placeholder="Опишите нарушение..."
                rows={4}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleReport} variant="destructive">
              Отправить жалобу
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить объявление?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Это действие нельзя отменить. Объявление будет удалено навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteListingId && handleDeleteListing(deleteListingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
