import React, { useState, useEffect } from 'react';
import { format, parseISO, addHours, isToday, isTomorrow, isSameWeek, isValid } from 'date-fns';
import { toast } from 'react-toastify';
import { 
  ExternalLink, Trash2, Calendar, Clock, Award, 
  Bookmark, CalendarDays, ChevronRight, Filter
} from 'lucide-react';
import axiosInstance from '@/utils/axiosConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import Navbar from '../components/Navbar';


const ContestCalendar = ({ contests, onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  

  const getContestDates = () => {
    const dates = {};
    contests.forEach(bookmark => {
      if (!bookmark.contest?.start_time) return;
      try {
        const date = parseISO(bookmark.contest.start_time);
        if (isValid(date)) {
          const dateKey = format(date, 'yyyy-MM-dd');
          if (!dates[dateKey]) dates[dateKey] = [];
          dates[dateKey].push(bookmark);
        }
      } catch (error) {
        console.error("Error parsing date:", error);
      }
    });
    return dates;
  };

  const contestDates = getContestDates();



  const handleDateSelect = (date) => {
    if (!date || !isValid(date)) return;
    
    setSelectedDate(date);
    const dateKey = format(date, 'yyyy-MM-dd');
    onDateSelect(contestDates[dateKey] || []);
  };
  
  return (
    <Card className="bg-background border border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Contest Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full flex justify-center custom-calendar">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md"
            modifiers={{
              contest: date => {
                if (!date || !isValid(date)) return false;
                const dateKey = format(date, 'yyyy-MM-dd');
                return !!contestDates[dateKey];
              }
            }}
            modifiersClassNames={{
              contest: "bg-green-100 dark:bg-green-900/30 rounded-md"
            }}
          />
        </div>
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded-full"></div>
            <span className="text-xs text-muted-foreground">Contest scheduled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const BookmarksPage = () => {
  const [bookmarkedContests, setBookmarkedContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarView, setCalendarView] = useState(false);
  const [selectedDateContests, setSelectedDateContests] = useState([]);
  const [filterType, setFilterType] = useState('all');

  const platformLogos = {
    'Codeforces': 'https://codeforces.org/s/0/favicon-32x32.png',
    'Codechef': 'https://www.codechef.com/favicon.ico',
    'Leetcode': 'https://leetcode.com/favicon.ico',
    'Atcoder': 'https://img.atcoder.jp/assets/favicon.png',
    'HackerRank': 'https://hrcdn.net/community-frontend/assets/favicon-ddc852f75a.png',
    'HackerEarth': 'https://static-fastly.hackerearth.com/static/favicon.ico'
  };

  const platformColors = {
    'Codeforces': 'from-red-500 to-red-600',
    'Codechef': 'from-amber-500 to-amber-600',
    'Leetcode': 'from-yellow-500 to-yellow-600',
    'Atcoder': 'from-blue-500 to-blue-600',
    'HackerRank': 'from-green-500 to-green-600',
    'HackerEarth': 'from-purple-500 to-purple-600',
    'default': 'from-slate-500 to-slate-600'
  };

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('bookmark/getAll');
      if (response.data.success) {
        setBookmarkedContests(response.data.data.bookmarks || []);
        console.log('Bookmarks loaded:', response.data.data.bookmarks);
      } else {
        console.error('Failed to fetch bookmarks:', response.data.message);
        toast.error(response.data.message || 'Failed to fetch bookmarks');
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast.error('Error fetching bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (contestId) => {
    try {
      const response = await axiosInstance.delete(`bookmark/delete/${contestId}`);
      if (response.data.success) {
        setBookmarkedContests(prev => prev.filter(bookmark => bookmark.contest._id !== contestId));
        setSelectedDateContests(prev => prev.filter(bookmark => bookmark.contest._id !== contestId));
        toast.success('Bookmark removed');
      } else {
        toast.error(response.data.message || 'Failed to remove bookmark');
      }
    } catch (error) {
      toast.error('Error removing bookmark');
      console.error('Error removing bookmark:', error);
    }
  };

  const openContestLink = (url) => {
    if (!url) {
      toast.warning('No contest link available');
      return;
    }
    window.open(url, '_blank');
  };

  const sortedBookmarks = () => {
    return [...bookmarkedContests].sort((a, b) => {
      if (!a.contest?.start_time) return 1;
      if (!b.contest?.start_time) return -1;
      
      const dateA = new Date(a.contest.start_time);
      const dateB = new Date(b.contest.start_time);
      return dateA - dateB;
    });
  };

  const filterBookmarks = (isPast) => {
    const now = new Date();
    return sortedBookmarks().filter(bookmark => {
      if (!bookmark.contest || !bookmark.contest.start_time) return false;
      
      try {
        const startTime = parseISO(bookmark.contest.start_time);
        if (!isValid(startTime)) return false;
        
        const endTime = addHours(startTime, parseDuration(bookmark.contest.duration));
        return isPast ? endTime < now : endTime >= now;
      } catch (error) {
        console.error("Error parsing date:", error);
        return false;
      }
    });
  };

  const filterUpcomingByTime = (contests) => {
    if (filterType === 'all') return contests;
    
    const now = new Date();
    return contests.filter(bookmark => {
      if (!bookmark.contest?.start_time) return false;
      
      try {
        const startTime = parseISO(bookmark.contest.start_time);
        if (!isValid(startTime)) return false;
        
        switch(filterType) {
          case 'today':
            return isToday(startTime);
          case 'tomorrow':
            return isTomorrow(startTime);
          case 'thisWeek':
            return isSameWeek(startTime, now);
          default:
            return true;
        }
      } catch (error) {
        console.error("Error parsing date:", error);
        return false;
      }
    });
  };

  const handleCalendarDateSelect = (contests) => {
    setSelectedDateContests(contests);
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4 max-w-6xl flex justify-center items-center h-64">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-t-green-500 border-r-green-400 border-b-green-300 border-l-green-200 animate-spin"></div>
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="w-6 h-6 rounded-full bg-background animate-pulse"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const upcomingContests = filterBookmarks(false);
  const filteredUpcomingContests = filterUpcomingByTime(upcomingContests);

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br justify-center w-full mx-auto flex  from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border border-green-100 dark:border-green-900/50 p-6 mb-8">
          <div className="animate-pulse-slow absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-green-300/20 to-green-500/30 dark:from-green-400/10 dark:to-green-600/20 blur-3xl"></div>
          <div className="animate-pulse-slow absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-gradient-to-tr from-emerald-300/20 to-emerald-500/30 dark:from-emerald-400/10 dark:to-emerald-600/20 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex text-center justify-center w-full mx-auto items-center gap-3 mb-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg text-white">
                <Bookmark className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Your Contest Collection</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Track your favorite programming competitions in one place. Switch between list and calendar views to manage your contest schedule efficiently.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-background border border-border shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-background to-background border-b border-border p-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold">Bookmarked Contests</CardTitle>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-9 w-9 p-0"
                            onClick={() => setCalendarView(!calendarView)}
                          >
                            {calendarView ? <ChevronRight className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{calendarView ? 'List View' : 'Calendar View'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {!calendarView && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-9">
                            <Filter className="h-4 w-4 mr-2" />
                            {filterType === 'all' ? 'All' : 
                             filterType === 'today' ? 'Today' : 
                             filterType === 'tomorrow' ? 'Tomorrow' : 'This Week'}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setFilterType('all')}>All Contests</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setFilterType('today')}>Today</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setFilterType('tomorrow')}>Tomorrow</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setFilterType('thisWeek')}>This Week</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {calendarView ? (
                  <div className="p-4">
                    {selectedDateContests.length > 0 ? (
                      <div className="mt-4 space-y-4">
                        <h3 className="text-lg font-medium pl-1">
                          {selectedDateContests[0].contest?.start_time ? 
                            `Contests on ${format(parseISO(selectedDateContests[0].contest.start_time), 'MMMM d, yyyy')}` :
                            "Scheduled Contests"}
                        </h3>
                        <div className="space-y-3">
                          {selectedDateContests.map(bookmark => (
                            <BookmarkCard 
                              key={bookmark._id} 
                              bookmark={bookmark} 
                              removeBookmark={removeBookmark}
                              openContestLink={openContestLink}
                              platformLogos={platformLogos}
                              platformColors={platformColors}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        <p>Select a date to view contests</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <Tabs defaultValue="upcoming" className="w-full">
                    <div className="px-4 pt-2">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upcoming" className="text-sm">Upcoming</TabsTrigger>
                        <TabsTrigger value="past" className="text-sm">Past</TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="upcoming" className="p-4 pt-6 space-y-4">
                      {filteredUpcomingContests.length > 0 ? (
                        <div className="space-y-4">
                          {filteredUpcomingContests.map((bookmark) => (
                            <BookmarkCard 
                              key={bookmark._id} 
                              bookmark={bookmark} 
                              removeBookmark={removeBookmark}
                              openContestLink={openContestLink}
                              platformLogos={platformLogos}
                              platformColors={platformColors}
                            />
                          ))}
                        </div>
                      ) : (
                        <EmptyState message={
                          filterType !== 'all' 
                            ? `No contests ${filterType === 'today' ? 'today' : filterType === 'tomorrow' ? 'tomorrow' : 'this week'}.` 
                            : "You haven't bookmarked any upcoming contests yet."
                        } />
                      )}
                    </TabsContent>
                    
                    <TabsContent value="past" className="p-4 pt-6 space-y-4">
                      {filterBookmarks(true).length > 0 ? (
                        <div className="space-y-4">
                          {filterBookmarks(true).map((bookmark) => (
                            <BookmarkCard 
                              key={bookmark._id} 
                              bookmark={bookmark} 
                              removeBookmark={removeBookmark}
                              openContestLink={openContestLink}
                              platformLogos={platformLogos}
                              platformColors={platformColors}
                              isPast={true}
                            />
                          ))}
                        </div>
                      ) : (
                        <EmptyState message="No past bookmarked contests found." />
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="hidden w-full lg:block">
            <ContestCalendar 
              contests={bookmarkedContests}
              onDateSelect={handleCalendarDateSelect}
            />
            
            <Card className="mt-6 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/30 border border-green-200 dark:border-green-800/50 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Contest Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Bookmarks</span>
                    <span className="font-semibold">{bookmarkedContests.length}</span>
                  </div>
                  <Separator className="bg-green-200/50 dark:bg-green-800/30" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Upcoming</span>
                    <span className="font-semibold">{upcomingContests.length}</span>
                  </div>
                  <Separator className="bg-green-200/50 dark:bg-green-800/30" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Today's Contests</span>
                    <span className="font-semibold">
                      {upcomingContests.filter(bookmark => {
                        if (!bookmark.contest?.start_time) return false;
                        try {
                          const startTime = parseISO(bookmark.contest.start_time);
                          return isValid(startTime) && isToday(startTime);
                        } catch (error) {
                          return false;
                        }
                      }).length}
                    </span>
                  </div>
                  
                  <div className="pt-2">
                    <h4 className="text-sm font-medium mb-3">Platform Distribution</h4>
                    <div className="space-y-2">
                      {Object.entries(
                        bookmarkedContests.reduce((acc, bookmark) => {
                          const platform = bookmark.contest?.platform;
                          if (!platform) return acc;
                          acc[platform] = (acc[platform] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([platform, count]) => (
                        <div key={platform} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span>{platform}</span>
                            <span>{count}</span>
                          </div>
                          <div className="h-2 w-full bg-green-200/50 dark:bg-green-800/30 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${platformColors[platform] || platformColors.default}`}
                              style={{ width: `${(count / bookmarkedContests.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

const BookmarkCard = ({ bookmark, removeBookmark, openContestLink, platformLogos, platformColors, isPast = false }) => {
  const { _id, contest } = bookmark;
  
  if (!contest) return null;
  
  let startTime, endTime, now;
  let status = "Upcoming";
  let statusColor = "bg-blue-500";

  try {
    startTime = parseISO(contest.start_time);
    if (!isValid(startTime)) {
      startTime = new Date();
    }
    
    endTime = addHours(startTime, parseDuration(contest.duration));
    now = new Date();
    
 
    if (isPast) {
      status = "Completed";
      statusColor = "bg-gray-500";
    } else if (now >= startTime && now <= endTime) {
      status = "Ongoing";
      statusColor = "bg-green-500";
    } else if (isToday(startTime)) {
      status = "Today";
      statusColor = "bg-amber-500";
    }
  } catch (error) {
    console.error("Error parsing date:", error);
    startTime = new Date();
    endTime = new Date();
  }

  const platformColorGradient = platformColors[contest.platform] || platformColors.default;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border border-border bg-gradient-to-r from-background to-background hover:from-green-50/30 hover:to-emerald-50/30 dark:hover:from-green-950/10 dark:hover:to-emerald-950/5">
      <CardContent className="p-0">
        <div className="relative">
          <div className={`absolute h-full w-1 bg-gradient-to-b ${platformColorGradient}`}></div>
          <div className="pl-4 pr-3 py-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <h3 className="text-lg font-semibold text-foreground hover:text-primary cursor-pointer line-clamp-1">
                      {contest.name}
                    </h3>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex justify-between space-x-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">{contest.name}</h4>
                        <div className="flex items-center pt-2">
                          <Badge variant="outline" className="mr-2">
                            <img 
                              src={platformLogos[contest.platform] || '/placeholder-logo.png'} 
                              alt={contest.platform}
                              className="w-3 h-3 mr-1"
                            />
                            {contest.platform}
                          </Badge>
                          <span className={`text-xs px-2 py-1 rounded-full text-white ${statusColor}`}>
                            {status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                
                <div className="flex items-center mt-1">
                  <Badge 
                    className={`bg-gradient-to-r ${platformColorGradient} text-white border-none`}
                  >
                    <img 
                      src={platformLogos[contest.platform] || '/placeholder-logo.png'} 
                      alt={contest.platform}
                      className="w-3 h-3 mr-1"
                    />
                    {contest.platform}
                  </Badge>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full text-white ${statusColor}`}>
                    {status}
                  </span>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                      onClick={() => removeBookmark(contest._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove bookmark</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex flex-col gap-2 mb-4 text-muted-foreground">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-green-500" />
                {format(startTime, 'MMMM d, yyyy')}
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-green-500" />
                {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
              </div>
              <div className="flex items-center text-sm">
                <Award className="h-4 w-4 mr-2 text-green-500" />
                Duration: {contest.duration || 'N/A'}
              </div>
            </div>
            
            <Button 
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-none"
              onClick={() => openContestLink(contest.url)}
            >
              {isPast ? 'View Contest' : 'Go to Contest'} <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/10 rounded-lg border border-dashed border-green-200 dark:border-green-800/30">
      <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-800/30 dark:to-emerald-800/30 p-4 rounded-full mb-4">
        <Bookmark className="h-10 w-10 text-green-500 dark:text-green-400" />
      </div>
      <p className="text-muted-foreground text-center">{message}</p>
      <Button variant="outline" className="mt-4 border-green-200 dark:border-green-800/50 bg-white/50 dark:bg-background/50 hover:bg-green-100/50 dark:hover:bg-green-900/20">
        Browse Contests
      </Button>
    </div>
  );
};

const parseDuration = (durationStr) => {
  if (!durationStr) return 2;
  try {
    const hours = durationStr.match(/(\d+)h/);
    if (hours) return parseInt(hours[1]);
    const minutes = durationStr.match(/(\d+)m/);
    if (minutes) return parseInt(minutes[1]) / 60;
  } catch (error) {
    console.error("Error parsing duration:", error);
  }
  return 2;
};



export default BookmarksPage;