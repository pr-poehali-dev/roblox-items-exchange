import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Listing {
  id: number;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  seller: string;
  rating: number;
}

interface Review {
  id: number;
  author: string;
  rating: number;
  text: string;
  date: string;
}

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('listings');
  const [searchQuery, setSearchQuery] = useState('');
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    imageUrl: ''
  });

  const [listings, setListings] = useState<Listing[]>([
    {
      id: 1,
      title: 'Dominus Empyreus',
      description: 'Редкая шапка, отличное состояние',
      price: '50,000 R$',
      imageUrl: '/placeholder.svg',
      seller: 'TraderPro',
      rating: 4.8
    },
    {
      id: 2,
      title: 'Valkyrie Helm',
      description: 'Легендарный шлем валькирии',
      price: '35,000 R$',
      imageUrl: '/placeholder.svg',
      seller: 'RoItems',
      rating: 4.9
    },
    {
      id: 3,
      title: 'Sparkle Time Fedora',
      description: 'Лимитированная федора с эффектами',
      price: '120,000 R$',
      imageUrl: '/placeholder.svg',
      seller: 'TopSeller',
      rating: 5.0
    }
  ]);

  const [reviews] = useState<Review[]>([
    {
      id: 1,
      author: 'Player123',
      rating: 5,
      text: 'Отличный продавец, всё быстро и честно!',
      date: '2 дня назад'
    },
    {
      id: 2,
      author: 'RoFan',
      rating: 4,
      text: 'Хорошая сделка, рекомендую',
      date: '5 дней назад'
    }
  ]);

  const handleCreateListing = () => {
    if (!newListing.title || !newListing.price) {
      toast({
        title: "Ошибка",
        description: "Заполните название и цену",
        variant: "destructive"
      });
      return;
    }

    const listing: Listing = {
      id: listings.length + 1,
      ...newListing,
      imageUrl: newListing.imageUrl || '/placeholder.svg',
      seller: 'Вы',
      rating: 0
    };

    setListings([listing, ...listings]);
    setNewListing({ title: '', description: '', price: '', imageUrl: '' });
    setActiveTab('listings');
    
    toast({
      title: "Готово!",
      description: "Объявление создано успешно"
    });
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Package" className="text-primary-foreground" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-foreground">RoTrade</h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost" onClick={() => setActiveTab('listings')}>
                <Icon name="Store" size={18} className="mr-2" />
                Объявления
              </Button>
              <Button variant="ghost" onClick={() => setActiveTab('create')}>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать
              </Button>
              <Button variant="ghost" onClick={() => setActiveTab('profile')}>
                <Icon name="User" size={18} className="mr-2" />
                Профиль
              </Button>
              <Button variant="ghost" onClick={() => setActiveTab('reviews')}>
                <Icon name="Star" size={18} className="mr-2" />
                Отзывы
              </Button>
            </nav>

            <Button className="bg-primary hover:bg-primary/90">
              <Icon name="LogIn" size={18} className="mr-2" />
              Войти
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 md:hidden mb-6">
            <TabsTrigger value="listings">
              <Icon name="Store" size={16} />
            </TabsTrigger>
            <TabsTrigger value="create">
              <Icon name="Plus" size={16} />
            </TabsTrigger>
            <TabsTrigger value="profile">
              <Icon name="User" size={16} />
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <Icon name="Star" size={16} />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">Объявления</h2>
                  <p className="text-muted-foreground">Найдите лучшие предложения по вещам Roblox</p>
                </div>
                <div className="w-full md:w-96">
                  <div className="relative">
                    <Icon name="Search" className="absolute left-3 top-3 text-muted-foreground" size={18} />
                    <Input
                      placeholder="Поиск по названию..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <CardTitle className="text-lg">{listing.title}</CardTitle>
                        {listing.rating > 0 && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Icon name="Star" size={12} />
                            {listing.rating}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2 mb-3">
                        {listing.description}
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">{listing.price}</span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon name="User" size={14} />
                          {listing.seller}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        <Icon name="MessageCircle" size={16} className="mr-2" />
                        Связаться
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Создать объявление</CardTitle>
                  <CardDescription>
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
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      placeholder="Опишите предмет, его состояние и особенности..."
                      rows={4}
                      value={newListing.description}
                      onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Цена *</Label>
                    <Input
                      id="price"
                      placeholder="50,000 R$"
                      value={newListing.price}
                      onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                    />
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
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>TP</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-2xl">TraderPro</CardTitle>
                      <CardDescription>Участник с октября 2024</CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Icon name="Star" size={12} />
                          4.8
                        </Badge>
                        <Badge>Проверенный продавец</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-primary">24</div>
                      <div className="text-sm text-muted-foreground">Сделок</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-primary">18</div>
                      <div className="text-sm text-muted-foreground">Отзывов</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-primary">4.8</div>
                      <div className="text-sm text-muted-foreground">Рейтинг</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Активные объявления</h3>
                    <div className="space-y-2">
                      {listings.slice(0, 3).map((listing) => (
                        <div key={listing.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-background rounded overflow-hidden">
                              <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="font-medium">{listing.title}</div>
                              <div className="text-sm text-muted-foreground">{listing.price}</div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Icon name="MoreVertical" size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="max-w-3xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Отзывы пользователей</CardTitle>
                  <CardDescription>
                    Что говорят другие о продавцах и покупателях
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarFallback>{review.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-semibold">{review.author}</div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Icon
                                  key={i}
                                  name="Star"
                                  size={14}
                                  className={i < review.rating ? 'fill-accent text-accent' : 'text-muted'}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{review.text}</p>
                          <div className="text-xs text-muted-foreground">{review.date}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t mt-16 py-8 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Package" className="text-primary-foreground" size={20} />
              </div>
              <span className="font-bold text-lg">RoTrade</span>
            </div>
            
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">О проекте</a>
              <a href="#" className="hover:text-foreground transition-colors">Правила</a>
              <a href="#" className="hover:text-foreground transition-colors">Поддержка</a>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t text-center">
            <div className="flex items-center justify-center gap-2 text-destructive font-medium mb-2">
              <Icon name="AlertTriangle" size={18} />
              <span>ВАЖНО</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
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
    </div>
  );
};

export default Index;