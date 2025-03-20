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
  X,
  ChevronDown
} from 'lucide-react';
import { format, isPast, parseISO, addHours, isAfter } from 'date-fns';
import { toast } from 'react-toastify';
import axiosInstance from '@/utils/axiosConfig';
import { FaYoutube } from 'react-icons/fa';
import { useAuthData } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  const [activeTab, setActiveTab] = useState("upcoming");
  const [hoverCard, setHoverCard] = useState(null);
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
    setIsAdmin(userData.role === 'admin')
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

  const ContestRow = ({ contest, showBookmark = false, isPastTab = false, index }) => {
    if (!contest || !contest.start_time) {
      return null;
    }
    
    const startTime = parseISO(contest.start_time);
    const endTime = addHours(startTime, parseDuration(contest.duration));
    const isPastContest = isPast(endTime);
    const bookmarked = isBookmarked(contest._id);
    const isHovered = hoverCard === contest._id;
    

    const now = new Date();
    const timeRemaining = startTime.getTime() - now.getTime();
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return (
      <Card 
        className={`mb-4 overflow-hidden transition-all duration-300 border hover:shadow-lg hover:border-emerald-500/50 ${isHovered ? 'transform  shadow-lg' : ''}`}
        onMouseEnter={() => setHoverCard(contest._id)}
        onMouseLeave={() => setHoverCard(null)}
      >
        <div className={`h-1 w-full ${isPastContest ? 'bg-gradient-to-r from-slate-400 to-slate-300 dark:from-slate-700 dark:to-slate-600' : 'bg-gradient-to-r from-emerald-500 to-green-500'}`}></div>
        <CardContent className="p-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="relative w-12 h-12 overflow-hidden rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900 dark:to-green-900">
                    <img 
                      src={platformLogos[contest.platform] || '/placeholder-logo.png'}
                      alt={contest.platform}
                      className="w-8 h-8 object-contain"
                      title={contest.platform}
                    />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-left mb-1 line-clamp-2">{contest.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground space-x-2">
                    <span>{contest.platform}</span>
                    <span>•</span>
                    <span>{contest.duration || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-between">
              <div className="flex flex-col space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="font-medium">{format(startTime, 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Time:</span>
                  <span className="font-medium">{format(startTime, 'hh:mm a')}</span>
                </div>
                
                {!isPastContest && (
                  <div className="mt-2">
                    <div className="text-sm text-center font-medium">
                      {days > 0 ? `${days}d ${hours}h ${minutes}m` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`} remaining
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-1 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-green-500 h-1.5 rounded-full" 
                        style={{ width: `${Math.min(100, (timeRemaining / (1000 * 60 * 60 * 24 * 7)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 mt-4">
                <Button 
                  size="sm"
                  variant="outline" 
                  className="flex items-center bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 dark:hover:from-emerald-900/30 dark:hover:to-green-900/30 transition-all duration-300"
                  onClick={() => handleOpenLink(contest.url, 'contest')}
                  disabled={!contest.url}
                >
                  {isPastContest ? 'View' : 'Register'} <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
                
                {contest.pcdLink ? (
                  <Button 
                    size="sm"
                    variant="secondary" 
                    className="flex items-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                    onClick={() => handleOpenLink(contest.pcdLink, 'PCD')}
                  >
                    <FaYoutube className="h-4 w-4 mr-1" /> PCD
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
                    className={`flex items-center ${bookmarked ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'} hover:bg-transparent`}
                    onClick={() => toggleBookmark(contest._id)}
                    title={bookmarked ? "Remove bookmark" : "Bookmark this contest"}
                  >
                    {bookmarked ? (
                      <BookmarkCheck className="h-5 w-5" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-6xl opacity-30 mb-4">🏆</div>
        <div className="text-lg font-medium text-muted-foreground">
          {message}
        </div>
        <div className="mt-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedPlatforms(['All'])}
            className="text-sm"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    );
  };

  const PcdLinkModal = () => {
    if (!showPcdForm) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm">
        <Card className="w-full max-w-md border border-emerald-500/20 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-4">Add PCD Link</h3>
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
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={closePcdForm}>
                Cancel
              </Button>
              <Button 
                onClick={submitPcdLink}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
              >
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="mx-auto relative">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-emerald-500 opacity-10 dark:opacity-5 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -right-10 w-72 h-72 bg-green-500 opacity-10 dark:opacity-5 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-10 left-1/3 w-72 h-72 bg-teal-500 opacity-10 dark:opacity-5 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
            Coding Contests
          </h1>
          <p className="text-muted-foreground">Find and track competitive programming contests across various platforms</p>
        </div>

        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="relative">
              <div 
                className="flex items-center border rounded-md p-3 w-full md:w-80 cursor-pointer bg-background hover:bg-accent/50 transition-colors"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="flex flex-1 flex-wrap gap-1">
                  {selectedPlatforms.includes('All') ? (
                    <span className="flex items-center">
                      All Platforms <ChevronDown className="ml-1 h-4 w-4" />
                    </span>
                  ) : (
                    <>
                      <span className="text-sm text-muted-foreground mr-2">Platforms:</span>
                      {selectedPlatforms.map(platform => (
                        <Badge key={platform} variant="secondary" className="mr-1 flex items-center gap-1 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900 dark:to-green-900">
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
                      ))}
                    </>
                  )}
                </div>
              </div>
              
              {dropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg">
                  <div className="p-2">
                    {platforms.map(platform => (
                      <div 
                        key={platform}
                        className={`flex items-center p-2 hover:bg-accent cursor-pointer rounded transition-colors ${
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
                      className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              <Tabs 
                defaultValue="upcoming" 
                className="w-full md:w-auto"
                onValueChange={setActiveTab}
                value={activeTab}
              >
                <TabsList className="grid w-full grid-cols-2 h-12">
                  <TabsTrigger 
                    value="upcoming"
                    className={`text-sm md:text-base ${activeTab === "upcoming" ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white" : ""}`}
                  >
                    Upcoming Contests
                  </TabsTrigger>
                  <TabsTrigger 
                    value="past"
                    className={`text-sm md:text-base ${activeTab === "past" ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white" : ""}`}
                  >
                    Past Contests
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="container mx-auto p-4 max-w-6xl flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-t-green-500 border-r-green-400 border-b-green-300 border-l-green-200 animate-spin"></div>
              <div className="absolute inset-0 flex justify-center items-center">
                <div className="w-6 h-6 rounded-full bg-background animate-pulse"></div>
              </div>
            </div>
          </div>
          ) : (
            <Tabs 
              defaultValue="upcoming" 
              className="w-full"
              onValueChange={setActiveTab}
              value={activeTab}
            >
              <TabsContent value="upcoming" className="mt-0">
                {upcomingContests.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingContests.map((contest, index) => (
                      <ContestRow 
                        key={contest._id || Math.random().toString(36)} 
                        contest={contest}
                        showBookmark={true} 
                        isPastTab={false}
                        index={index}
                      />
                    ))}
                    {hasMoreUpcoming && (
                      <div className="flex justify-center py-4">
                        <Button 
                          onClick={fetchMoreUpcoming} 
                          variant="outline"
                          className="border-dashed border-emerald-300 dark:border-emerald-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
                        >
                          Load More Contests
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyState type="upcoming" />
                )}
              </TabsContent>
              
              <TabsContent value="past" className="mt-0">
                {pastContests.length > 0 ? (
                  <div className="space-y-2">
                    {pastContests.map((contest, index) => (
                      <ContestRow 
                        key={contest._id || Math.random().toString(36)} 
                        contest={contest}
                        showBookmark={false}
                        isPastTab={true}
                        index={index}
                      />
                    ))}
                    {hasMorePast && (
                      <div className="flex justify-center py-4">
                        <Button 
                          onClick={fetchMorePast} 
                          variant="outline"
                          className="border-dashed border-emerald-300 dark:border-emerald-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
                        >
                          Load More Contests
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyState type="past" />
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
      
      
      <PcdLinkModal />

      <style jsx>{`
        @keyframes blob {
          0% { transform: scale(1) translate(0, 0); }
          33% { transform: scale(1.1) translate(30px, -20px); }
          66% { transform: scale(0.9) translate(-20px, 20px); }
          100% { transform: scale(1) translate(0, 0); }
        }
        .animate-blob {
          animation: blob 10s infinite alternate;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .transform.scale-101 {
          transform: scale(1.01);
        }
      `}</style>
    </div>
  );
};

export default ContestTableDisplay;