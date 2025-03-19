import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, 
  Youtube, 
  Bookmark, 
  BookmarkCheck, 
  PlusCircle, 
  X 
} from 'lucide-react';
import { format, isPast, parseISO, addHours, isAfter } from 'date-fns';
import { toast } from 'react-toastify';
import axiosInstance from '@/utils/axiosConfig';
import { FaYoutube } from 'react-icons/fa';
import { useAuthData } from '../context/AuthContext';
import {  useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

const ContestTableDisplay = () => {
  const [upcomingContests, setUpcomingContests] = useState([]);
  const [pastContests, setPastContests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [bookmarkedContests, setBookmarkedContests] = useState([]);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const {userData, isSignedIn} = useAuthData();
  
  const [showPcdForm, setShowPcdForm] = useState(false);
  const [selectedContestId, setSelectedContestId] = useState(null);
  const [pcdLinkInput, setPcdLinkInput] = useState('');
  

  const [selectedPlatforms, setSelectedPlatforms] = useState(['All']);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  

  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const [hasMoreUpcoming, setHasMoreUpcoming] = useState(true);
  const [hasMorePast, setHasMorePast] = useState(true);
  const limit = 10;
  

  const platforms = ['All', 'Codeforces', 'Codechef', 'Leetcode', 'Atcoder', 'HackerRank'];


  const platformLogos = {
    'Codeforces': 'https://codeforces.org/s/0/favicon-32x32.png',
    'Codechef': 'https://www.codechef.com/favicon.ico',
    'Leetcode': 'https://leetcode.com/favicon.ico',
    'Atcoder': 'https://img.atcoder.jp/assets/favicon.png',
    'HackerRank': 'https://hrcdn.net/community-frontend/assets/favicon-ddc852f75a.png',
    'HackerEarth': 'https://static-fastly.hackerearth.com/static/favicon.ico'
  };

  const parseDuration = (durationStr) => {
    if (!durationStr) return 2;
    const match = durationStr.match(/(\d+)h/);
    return match ? parseInt(match[1]) : 2; 
  };

 
  useEffect(() => {
    setIsAdmin(userData.role == 'admin')
  }, [userData]);


  const handlePlatformSelect = (platform) => {
    setSelectedPlatforms(prev => {
    
      if (platform === 'All') {
        return ['All'];
      }
      
     
      const newSelected = prev.includes('All') 
        ? [platform] 
        : prev.includes(platform)
          ? prev.filter(p => p !== platform)
          : [...prev, platform];
      
      
      return newSelected.length === 0 ? ['All'] : newSelected;
    });
  };


  const fetchContests = async (page, isPast) => {
    try {
      const sortOrder = isPast ? '-start_time' : 'start_time'; 
      
     
      const params = {
        page,
        limit,
        sort: sortOrder
      };
      
      if (!selectedPlatforms.includes('All')) {
        selectedPlatforms.forEach((platform, index) => {
          params[`platform[${index}]`] = platform;
        });
      }
      
      const response = await axiosInstance.get('contests/getAll', { params });

      if (response.data.success) {
        const now = new Date();
        const contestsArray = response.data.data.contests || [];
        
               
        const contests = contestsArray.filter(contest => {
          if (!contest || !contest.start_time) return false;
          
          const startTime = parseISO(contest.start_time);
          const endTime = addHours(startTime, parseDuration(contest.duration));
          return isPast ? !isAfter(endTime, now) : isAfter(endTime, now);
        });
        
      
        return {
          contests,
          currentPage: response.data.data.currentPage,
          totalPages: response.data.data.totalPages
        };
      } else {
        toast.error(response.data.message || 'Failed to fetch contests');
        return { contests: [], currentPage: 1, totalPages: 1 };
      }
    } catch (error) {
      toast.error('Error fetching contests');
      console.error('Error in fetchingContests:', error);
      return { contests: [], currentPage: 1, totalPages: 1 };
    }
  };


  const fetchBookmarks = async () => {
    try {
      if(isSignedIn){
        const response = await axiosInstance.get('bookmark/getAll');
        if (response.data.success) {
          setBookmarkedContests(response.data.data.bookmarks || []);
          console.log('Bookmarks loaded:', response.data.data.bookmarks);
        } else {
          console.error('Failed to fetch bookmarks:', response.data.message);
        }
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const navigate = useNavigate();
  const toggleBookmark = async (contestId) => {
    try {
      if(!isSignedIn){
        toast.info("Please login to bookmark contests.")
        navigate('/login',{replace:true})
        return;
      }
      if (isBookmarked(contestId)) {
        const response = await axiosInstance.delete(`bookmark/delete/${contestId}`);
        if (response.data.success) {
          setBookmarkedContests(prev => prev.filter(bookmark => 
            bookmark.contest._id !== contestId && bookmark._id !== contestId
          ));
          toast.success('Bookmark removed');
        } else {
          toast.error(response.data.message || 'Failed to remove bookmark');
        }
      } else {
        const response = await axiosInstance.post('bookmark/create', { contestId });
        if (response.data.success) {
          if (response.data.data && response.data.data.bookmark) {
            setBookmarkedContests(prev => [...prev, response.data.data.bookmark]);
          } else {
            fetchBookmarks();
          }
          toast.success('Contest bookmarked');
        } else {
          toast.error(response.data.message || 'Failed to bookmark contest');
        }
      }
    } catch (error) {
      toast.error('Error updating bookmark');
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleAddPcdLink = (contestId) => {
    setSelectedContestId(contestId);
    setPcdLinkInput('');
    setShowPcdForm(true);
  };

  const submitPcdLink = async () => {
    if (!pcdLinkInput || !selectedContestId) {
      toast.error('Please enter a valid YouTube link');
      return;
    }

    try {
      const response = await axiosInstance.put(`contests/addPcdLink/${selectedContestId}`, {
        pcdLink: pcdLinkInput
      });

      if (response.data.success) {
        setPastContests(prev => prev.map(contest => 
          contest._id === selectedContestId 
            ? { ...contest, pcdLink: pcdLinkInput }
            : contest
        ));
        
        toast.success('PCD link added successfully');
        setShowPcdForm(false);
      } else {
        toast.error(response.data.message || 'Failed to add PCD link');
      }
    } catch (error) {
      toast.error('Error adding PCD link');
      console.error('Error adding PCD link:', error);
    }
  };

  const closePcdForm = () => {
    setShowPcdForm(false);
    setSelectedContestId(null);
    setPcdLinkInput('');
  };

  const isBookmarked = (contestId) => {
    return bookmarkedContests.some(bookmark => 
      (bookmark.contest && bookmark.contest._id === contestId) || bookmark._id === contestId
    );
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await fetchBookmarks();
      
      const upcomingData = await fetchContests(1, false);
      setUpcomingContests(upcomingData.contests);
      setHasMoreUpcoming(upcomingData.currentPage < upcomingData.totalPages);
      
      const pastData = await fetchContests(1, true);
      setPastContests(pastData.contests);
      setHasMorePast(pastData.currentPage < pastData.totalPages);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

 
  useEffect(() => {
    setUpcomingPage(1);
    setPastPage(1);
    setUpcomingContests([]);
    setPastContests([]);
    
    console.log('Platform filter ', selectedPlatforms);
    

    loadInitialData();
  }, [selectedPlatforms]);

  const fetchMoreUpcoming = async () => {
    const nextPage = upcomingPage + 1;
    setUpcomingPage(nextPage);
    
    const data = await fetchContests(nextPage, false);
    setUpcomingContests(prev => [...prev, ...data.contests]);
    setHasMoreUpcoming(data.currentPage < data.totalPages);
  };

  const fetchMorePast = async () => {
    const nextPage = pastPage + 1;
    setPastPage(nextPage);
    
    const data = await fetchContests(nextPage, true);
    setPastContests(prev => [...prev, ...data.contests]);
    setHasMorePast(data.currentPage < data.totalPages);
  };


  const handleOpenLink = (url, linkType) => {
    if (!url) {
      toast.warning(`No ${linkType} link available`);
      return;
    }
    
    window.open(url, '_blank');
    toast.info(`Opening ${linkType} link`);
  };

  const ContestRow = ({ contest, showBookmark = false, isPastTab = false }) => {

    if (!contest || !contest.start_time) {
      return null;
    }
    
    const startTime = parseISO(contest.start_time);
    const endTime = addHours(startTime, parseDuration(contest.duration));
    const isPastContest = isPast(endTime);
    const bookmarked = isBookmarked(contest._id);
    
    return (
      <TableRow className="group">
        <TableCell className="font-medium">
          {contest.name}
        </TableCell>
        <TableCell className="text-center">
          <div className="flex justify-center">
            <img 
              src={platformLogos[contest.platform] || '/placeholder-logo.png'}
              alt={contest.platform}
              className="w-6 h-6"
              title={contest.platform}
            />
          </div>
        </TableCell>
        <TableCell>
          {format(startTime, 'MMM dd, yyyy')}
        </TableCell>
        <TableCell>
          {format(startTime, 'hh:mm a')} - {format(endTime, 'hh:mm a')}
        </TableCell>
        <TableCell>
          {contest.duration || 'N/A'}
        </TableCell>
        <TableCell>
          <div className="flex space-x-2">
            <Button 
              size="sm"
              variant="outline" 
              className="flex items-center"
              onClick={() => handleOpenLink(contest.url, 'contest')}
              disabled={!contest.url}
            >
              {isPastContest ? 'View' : 'Register'} <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
            
            {contest.pcdLink ? (
              <Button 
                size="sm"
                variant="secondary" 
                className="flex items-center text-red-600 dark:text-red-400 cursor-pointer"
                onClick={() => handleOpenLink(contest.pcdLink, 'PCD')}
              >
                <FaYoutube className="h-4 w-4" />
              </Button>
            ) : (
              isAdmin && isPastTab && (
                <Button 
                  size="sm"
                  variant="secondary" 
                  className="flex items-center gap-1"
                  onClick={() => handleAddPcdLink(contest._id)}
                >
                  <PlusCircle className="h-3 w-3" /> PCD
                </Button>
              )
            )}
            
            {showBookmark && (
              <Button
                size="sm"
                variant="ghost"
                className={`flex items-center ${bookmarked ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}
                onClick={() => toggleBookmark(contest._id)}
                title={bookmarked ? "Remove bookmark" : "Bookmark this contest"}
              >
                {bookmarked ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  const EmptyState = ({ type }) => {
    let message;
    if (selectedPlatforms.includes('All')) {
      message = `No ${type} contests found`;
    } else if (selectedPlatforms.length === 1) {
      message = `No ${type} ${selectedPlatforms[0]} contests found`;
    } else {
      message = `No ${type} contests found for the selected platforms`;
    }
    
    return (
      <TableRow>
        <TableCell colSpan={6} className="h-32 text-center">
          <div className="text-muted-foreground">
            {message}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  const PcdLinkModal = () => {
    if (!showPcdForm) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Add PCD Link</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                YouTube URL
              </label>
              <input
                type="text"
                value={pcdLinkInput}
                onChange={(e) => setPcdLinkInput(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <Button variant="outline" onClick={closePcdForm}>
                Cancel
              </Button>
              <Button onClick={submitPcdLink}>
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="relative">
              <div 
                className="flex items-center border rounded-md p-2 w-full  md:w-80 cursor-pointer bg-background hover:bg-accent/50"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="flex flex-1 flex-wrap gap-1">
                  {selectedPlatforms.includes('All') ? (
                    <span>All Platforms</span>
                  ) : (
                    selectedPlatforms.map(platform => (
                      <Badge key={platform} variant="secondary" className="mr-1 flex items-center gap-1">
                        {platformLogos[platform] && (
                          <img
                            src={platformLogos[platform]}
                            alt={platform}
                            className="w-4 h-4"
                          />
                        )}
                        {platform}
                        <span 
                          className="cursor-pointer ml-1" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlatformSelect(platform);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </span>
                      </Badge>
                    ))
                  )}
                </div>
              </div>
              
              {dropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg">
                  <div className="p-2">
                    {platforms.map(platform => (
                      <div 
                        key={platform}
                        className={`flex items-center p-2 hover:bg-accent cursor-pointer rounded ${
                          selectedPlatforms.includes(platform) ? 'bg-accent/50' : ''
                        }`}
                        onClick={() => {
                          handlePlatformSelect(platform);
                          platform === 'All' && setDropdownOpen(false);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPlatforms.includes(platform)}
                          onChange={() => {}}
                          className="mr-2"
                        />
                        <div className="flex items-center">
                          {platform !== 'All' && (
                            <img
                              src={platformLogos[platform] || '/placeholder-logo.png'}
                              alt={platform}
                              className="w-4 h-4 mr-2"
                            />
                          )}
                          {platform}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t p-2 flex justify-end">
                    <Button 
                      size="sm" 
                      onClick={() => setDropdownOpen(false)}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">Upcoming Contests</TabsTrigger>
            <TabsTrigger value="past">Past Contests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            <Card id="upcoming-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4 text-center">Contest Name</TableHead>
                    <TableHead className="w-1/12 text-center">Platform</TableHead>
                    <TableHead className="w-1/8 text-center">Date</TableHead>
                    <TableHead className="w-1/6 text-center">Time</TableHead>
                    <TableHead className="w-1/12 text-center">Duration</TableHead>
                    <TableHead className="w-1/6 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingContests.length > 0 ? (
                    upcomingContests.map(contest => (
                      <ContestRow 
                        key={contest._id || Math.random().toString(36)} 
                        contest={contest}
                        showBookmark={true} 
                        isPastTab={false}
                      />
                    ))
                  ) : (
                    <EmptyState type="upcoming" />
                  )}
                </TableBody>
              </Table>
              {hasMoreUpcoming && (
                <div className="flex justify-center py-4">
                  <Button onClick={fetchMoreUpcoming} variant="outline">
                    Load More
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="past">
            <Card id="past-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4 text-center">Contest Name</TableHead>
                    <TableHead className="w-1/12 text-center">Platform</TableHead>
                    <TableHead className="w-1/8 text-center">Date</TableHead>
                    <TableHead className="w-1/6 text-center">Time</TableHead>
                    <TableHead className="w-1/12 text-center">Duration</TableHead>
                    <TableHead className="w-1/6 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastContests.length > 0 ? (
                    pastContests.map(contest => (
                      <ContestRow 
                        key={contest._id || Math.random().toString(36)} 
                        contest={contest}
                        showBookmark={false}
                        isPastTab={true}
                      />
                    ))
                  ) : (
                    <EmptyState type="past" />
                  )}
                </TableBody>
              </Table>
              {hasMorePast && (
                <div className="flex justify-center py-4">
                  <Button onClick={fetchMorePast} variant="outline">
                    Load More
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
   
      <PcdLinkModal />
    </div>
  );
};

export default ContestTableDisplay;