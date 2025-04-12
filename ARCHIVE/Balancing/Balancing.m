function varargout = Balancing(varargin)
% BALANCING MATLAB code for Balancing.fig
%      BALANCING, by itself, creates a new BALANCING or raises the existing
%      singleton*.
%
%      H = BALANCING returns the handle to a new BALANCING or the handle to
%      the existing singleton*.
%
%      BALANCING('CALLBACK',hObject,eventData,handles,...) calls the local
%      function named CALLBACK in BALANCING.M with the given input arguments.
%
%      BALANCING('Property','Value',...) creates a new BALANCING or raises the
%      existing singleton*.  Starting from the left, property value pairs are
%      applied to the GUI before Balancing_OpeningFcn gets called.  An
%      unrecognized property name or invalid value makes property application
%      stop.  All inputs are passed to Balancing_OpeningFcn via varargin.
%
%      *See GUI Options on GUIDE's Tools menu.  Choose "GUI allows only one
%      instance to run (singleton)".
%
% See also: GUIDE, GUIDATA, GUIHANDLES

% Edit the above text to modify the response to help Balancing

% Last Modified by GUIDE v2.5 27-Oct-2016 15:52:13

% Begin initialization code - DO NOT EDIT
gui_Singleton = 1;
gui_State = struct('gui_Name',       mfilename, ...
                   'gui_Singleton',  gui_Singleton, ...
                   'gui_OpeningFcn', @Balancing_OpeningFcn, ...
                   'gui_OutputFcn',  @Balancing_OutputFcn, ...
                   'gui_LayoutFcn',  [] , ...
                   'gui_Callback',   []);
if nargin && ischar(varargin{1})
    gui_State.gui_Callback = str2func(varargin{1});
end

if nargout
    [varargout{1:nargout}] = gui_mainfcn(gui_State, varargin{:});
else
    gui_mainfcn(gui_State, varargin{:});
end
% End initialization code - DO NOT EDIT


% --- Executes just before Balancing is made visible.
function Balancing_OpeningFcn(hObject, eventdata, handles, varargin)
% This function has no output args, see OutputFcn.
% hObject    handle to figure
% eventdata  reserved - to be defined in a future version of MATLAB
% handles    structure with handles and user data (see GUIDATA)
% varargin   command line arguments to Balancing (see VARARGIN)

% Choose default command line output for Balancing
handles.output = hObject;

%create default data for emtpy table
handles.tab=zeros(6,6);
handles.tab(:,1)=[6 5 9 7.5 NaN NaN]; %masses
handles.tab(:,2)=[80 100 120 60 100 100]; %radius
handles.tab(:,3)=[-60 70 260 430 0 400]+60; %length
handles.tab(:,4)=[0 60 135 270 NaN NaN];

%calculate
handles.tab(:,5)=handles.tab(:,1).*handles.tab(:,2);%MR
handles.tab(:,6)=handles.tab(:,3).*handles.tab(:,5);%MRL

%show data to table
handles.uitable1.Data=handles.tab;


%plot AXIAL
axes(handles.Axial)
delete(findobj('tag','rect'))
hmax=max(handles.tab(:,3)); hextent=hmax/20; hext=hextent/2;
height=8;
rectangle('Position',[-hextent,-0.1,hmax+2*hextent,0.2],'FaceColor','k','tag','rect')
rectangle('Position',[handles.tab(1,3)-hext -height/2 hextent height],'FaceColor',[0.7 0.7 0.7],'tag','rect')
rectangle('Position',[handles.tab(2,3)-hext -height/2 hextent height],'FaceColor',[0.7 0.7 0.7],'tag','rect')
rectangle('Position',[handles.tab(3,3)-hext -height/2 hextent height],'FaceColor',[0.7 0.7 0.7],'tag','rect')
rectangle('Position',[handles.tab(4,3)-hext -height/2 hextent height],'FaceColor',[0.7 0.7 0.7],'tag','rect')
rectangle('Position',[handles.tab(5,3)-hext -height/2 hextent height],'FaceColor','m','tag','rect')
rectangle('Position',[handles.tab(6,3)-hext -height/2 hextent height],'FaceColor','g','tag','rect')
xticks(sort(handles.tab(:,3)))

%plot RADIAL
handles.Radial=polaraxes('units','pixels','OuterPosition',[30 60 500 500]);
polarplot(handles.Radial,pi/180*handles.tab(1:4,end),handles.tab(1:4,2),'k*')
hold on
polarplot(handles.Radial,pi/180*handles.tab(5,end),handles.tab(5,2),'m*')
polarplot(handles.Radial,pi/180*handles.tab(6,end),handles.tab(6,2),'g*')
hold off
grid on

% Update handles structure
guidata(hObject, handles);

% UIWAIT makes Balancing wait for user response (see UIRESUME)
% uiwait(handles.figure1);


% --- Outputs from this function are returned to the command line.
function varargout = Balancing_OutputFcn(hObject, eventdata, handles) 
% varargout  cell array for returning output args (see VARARGOUT);
% hObject    handle to figure
% eventdata  reserved - to be defined in a future version of MATLAB
% handles    structure with handles and user data (see GUIDATA)

% Get default command line output from handles structure
varargout{1} = handles.output;


% --- Executes when entered data in editable cell(s) in uitable1.
function uitable1_CellEditCallback(hObject, eventdata, handles)
% hObject    handle to uitable1 (see GCBO)
% eventdata  structure with the following fields (see MATLAB.UI.CONTROL.TABLE)
%	Indices: row and column indices of the cell(s) edited
%	PreviousData: previous data for the cell(s) edited
%	EditData: string(s) entered by the user
%	NewData: EditData or its converted form set on the Data property. Empty if Data was not changed
%	Error: error string when failed to convert EditData to appropriate value for Data
% handles    structure with handles and user data (see GUIDATA)

ii=sub2ind(size(handles.tab),eventdata.Indices(1),eventdata.Indices(2));
handles.tab(ii)=eventdata.NewData;

%calculate
handles.tab(:,5)=handles.tab(:,1).*handles.tab(:,2);%MR
handles.tab(:,6)=handles.tab(:,5).*handles.tab(:,3);%MRL

%calc MRL; retrieve MM-theta and MM-mrl_abs
mrl=handles.tab(:,6);
mrlX=mrl.*cos(handles.tab(:,4)*pi/180);
mrlY=mrl.*sin(handles.tab(:,4)*pi/180);
mrlMMx=-nansum(mrlX);
mrlMMy=-nansum(mrlY);
[angMM,mag_mrl_MM]=cart2pol(mrlMMx,mrlMMy);
if angMM<0
    handles.tab(6,4)=angMM*180/pi+360;
else
    handles.tab(6,4)=angMM*180/pi;
end
handles.tab(6,6)=mag_mrl_MM;

%calc MM-mr and MM-r from MRL
handles.tab(6,5)=mag_mrl_MM/handles.tab(6,3); %MM-mr
%handles.tab(6,1)=mag_mrl_MM/handles.tab(6,3)/handles.tab(6,2); %MM-r

%calc MR; retrieve LL-theta and LL-mr_abs
mr=handles.tab(:,5);
mrX=mr.*cos(handles.tab(:,4)*pi/180);
mrY=mr.*sin(handles.tab(:,4)*pi/180);
mrLLx=-nansum(mrX);
mrLLy=-nansum(mrY);
[angLL,mag_mr_LL]=cart2pol(mrLLx,mrLLy);
if angLL<0
    handles.tab(5,4)=angLL*180/pi+360;
else
    handles.tab(5,4)=angLL*180/pi;
end
handles.tab(5,5)=mag_mr_LL;
%handles.tab(5,1)=mag_mr_LL/handles.tab(5,2);


%show
handles.uitable1.Data=handles.tab;
cla

%plot AXIAL
axes(handles.Axial)
delete(findobj('tag','rect'))
hmax=max(handles.tab(:,3)); hextent=hmax/20; hext=hextent/2;
height=8;
rectangle('Position',[-hextent,-0.1,hmax+2*hextent,0.2],'FaceColor','k','tag','rect')
rectangle('Position',[handles.tab(1,3)-hext -height/2 hextent height],'FaceColor',[0.7 0.7 0.7],'tag','rect')
rectangle('Position',[handles.tab(2,3)-hext -height/2 hextent height],'FaceColor',[0.7 0.7 0.7],'tag','rect')
rectangle('Position',[handles.tab(3,3)-hext -height/2 hextent height],'FaceColor',[0.7 0.7 0.7],'tag','rect')
rectangle('Position',[handles.tab(4,3)-hext -height/2 hextent height],'FaceColor',[0.7 0.7 0.7],'tag','rect')
rectangle('Position',[handles.tab(5,3)-hext -height/2 hextent height],'FaceColor','m','tag','rect')
rectangle('Position',[handles.tab(6,3)-hext -height/2 hextent height],'FaceColor','g','tag','rect')
xticks(sort(handles.tab(:,3)))

%plot RADIAL
handles.Radial=polaraxes('units','pixels','OuterPosition',[30 60 500 500]);
polarplot(handles.Radial,pi/180*handles.tab(1:4,end),handles.tab(1:4,2),'k*')
hold on
polarplot(handles.Radial,pi/180*handles.tab(5,end),handles.tab(5,2),'m*')
polarplot(handles.Radial,pi/180*handles.tab(6,end),handles.tab(6,2),'g*')
hold off
grid on


%plot MRL
axes(handles.MRL)
cla
title('MRL-diagram')

prevpoint=[0,0];
maxX=0; minX=0; maxY=0; minY=0;
for ii=[1 2 3 4]
        currpoint=prevpoint+[mrlX(ii) mrlY(ii)];
        prevpoint=currpoint;
        maxX=max(maxX,currpoint(1));
        minX=min(minX,currpoint(1));
        maxY=max(maxY,currpoint(2));
        minY=min(minY,currpoint(2));
end
xlim([minX-0.1*abs(minX) maxX+0.1*abs(maxX)]);
ylim([minY-0.1*abs(minX) maxY+0.1*abs(maxY)]);

prevpoint=[0,0];
for ii=[1 2 3 4]
        currpoint=prevpoint+[mrlX(ii) mrlY(ii)];
        arrow(prevpoint,currpoint,10)
        prevpoint=currpoint;
        
end
arrow(prevpoint,[0,0],10,'Color','m')
grid on
axis square

%plot MR
axes(handles.MR)
cla
title('MR-diagram')

prevpoint=[0,0];
maxX=0; minX=0; maxY=0; minY=0;
for ii=[1 2 3 4 6]
        currpoint=prevpoint+[mrX(ii) mrY(ii)];
        prevpoint=currpoint;
        maxX=max(maxX,currpoint(1));
        minX=min(minX,currpoint(1));
        maxY=max(maxY,currpoint(2));
        minY=min(minY,currpoint(2));
end
xlim([minX-0.1*abs(minX) maxX+0.1*abs(maxX)]);
ylim([minY-0.1*abs(minX) maxY+0.1*abs(maxY)]);

prevpoint=[0,0];
for ii=[1 2 3 4 6]
        currpoint=prevpoint+[mrX(ii) mrY(ii)];
        if ii==6
            arrow(prevpoint,currpoint,10,'Color','m')
        else
            arrow(prevpoint,currpoint,10)
        end
        prevpoint=currpoint;
end
arrow(prevpoint,[0,0],10,'Color','g')
grid on
axis square

guidata(hObject, handles);
