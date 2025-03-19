import React, { useState, useEffect } from 'react';
import { format, parseISO, addHours } from 'date-fns';
import { toast } from 'react-toastify';
import { ExternalLink, Trash2, Calendar, Clock, Award, Bookmark } from 'lucide-react';
import axiosInstance from '@/utils/axiosConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '../components/Navbar';

const BookmarksPage = () => {
  const [bookmarkedContests, setBookmarkedContests] = useState([]);
  const [loading, setLoading] = useState(true);

  const platformLogos = {
    'Codeforces': 'https://codeforces.org/s/0/favicon-32x32.png',
    'Codechef': 'https://www.codechef.com/favicon.ico',
    'Leetcode': 'https://leetcode.com/favicon.ico',
    'Atcoder': 'https://img.atcoder.jp/assets/favicon.png',
    'HackerRank': 'https://hrcdn.net/community-frontend/assets/favicon-ddc852f75a.png',
    'HackerEarth': 'https://static-fastly.hackerearth.com/static/favicon.ico'
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
      const dateA = new Date(a.contest?.start_time || 0);
      const dateB = new Date(b.contest?.start_time || 0);
      return dateA > dateB;
    });
  };

  const filterBookmarks = (isPast) => {
    const now = new Date();
    return sortedBookmarks().filter(bookmark => {
      if (!bookmark.contest || !bookmark.contest.start_time) return false;
      
      const startTime = parseISO(bookmark.contest.start_time);
      const endTime = addHours(startTime, parseDuration(bookmark.contest.duration));
      
      return isPast ? endTime < now : endTime >= now;
    });
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
     <Navbar />
    <div className="container mx-auto p-4 max-w-4xl">
     
      <Card className="mt-6 mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold">Your Bookmarked Contests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Manage your bookmarked contests to keep track of competitions you're interested in.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="upcoming" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming Contests</TabsTrigger>
          <TabsTrigger value="past">Past Contests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {filterBookmarks(false).length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filterBookmarks(false).map((bookmark) => (
                <BookmarkCard 
                  key={bookmark._id} 
                  bookmark={bookmark} 
                  removeBookmark={removeBookmark}
                  openContestLink={openContestLink}
                  platformLogos={platformLogos}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="You haven't bookmarked any upcoming contests yet." />
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {filterBookmarks(true).length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filterBookmarks(true).map((bookmark) => (
                <BookmarkCard 
                  key={bookmark._id} 
                  bookmark={bookmark} 
                  removeBookmark={removeBookmark}
                  openContestLink={openContestLink}
                  platformLogos={platformLogos}
                  isPast={true}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No past bookmarked contests found." />
          )}
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
};

const BookmarkCard = ({ bookmark, removeBookmark, openContestLink, platformLogos, isPast = false }) => {
  const { _id, contest } = bookmark;
  
  if (!contest) return null;
  
  const startTime = parseISO(contest.start_time);
  const endTime = addHours(startTime, parseDuration(contest.duration));


  const getPlatformVariant = (platform) => {
    const variants = {
      'Codeforces': 'destructive',
      'Codechef': 'warning',
      'Leetcode': 'default',
      'Atcoder': 'secondary',
      'HackerRank': 'success',
      'HackerEarth': 'purple'
    };
    return variants[platform] || 'outline';
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border border-border">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{contest.name}</h3>
              <div className="flex items-center mt-1">
                <Badge variant={getPlatformVariant(contest.platform)} className="mr-2">
                  <img 
                    src={platformLogos[contest.platform] || '/placeholder-logo.png'} 
                    alt={contest.platform}
                    className="w-4 h-4 mr-1"
                  />
                  {contest.platform}
                </Badge>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
              onClick={() => removeBookmark(contest._id)}
              title="Remove bookmark"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex flex-col gap-2 mb-4 text-muted-foreground">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2" />
              {format(startTime, 'MMMM d, yyyy')}
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2" />
              {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
            </div>
            <div className="flex items-center text-sm">
              <Award className="h-4 w-4 mr-2" />
              Duration: {contest.duration || 'N/A'}
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full bg-background hover:bg-accent"
            onClick={() => openContestLink(contest.url)}
          >
            {isPast ? 'View Contest' : 'Go to Contest'} <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg border border-dashed border-border">
      <div className="text-muted-foreground mb-2">
        <Bookmark className="h-12 w-12" />
      </div>
      <p className="text-muted-foreground text-center">{message}</p>
    </div>
  );
};

const parseDuration = (durationStr) => {
  if (!durationStr) return 2;
  const hours = durationStr.match(/(\d+)h/);
  if (hours) return parseInt(hours[1]);
  const minutes = durationStr.match(/(\d+)m/);
  if (minutes) return parseInt(minutes[1]) / 60;
  return 2;
};

export default BookmarksPage;