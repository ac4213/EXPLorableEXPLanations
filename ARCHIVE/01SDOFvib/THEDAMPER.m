%THE DAMPER

l=4; w=1;
Lmin=2*l+0.3;
Lmax=3*l; %(2+4*sqrt(2))*l;
L0=[Lmin (Lmax+Lmin)/2 Lmax]; %Lmax=12
rgb={'r','m','b'};
c=1.05*l;

aa=axes;
hold on

for ii=1
h=L0(ii)-2*l;
p0x=ii*2; p0y=0;

%moving stem
p1x=p0x; p1y=p0y+l;
line(aa,[p0x,p1x],[p0y,p1y],'Color',rgb{ii}); %stem from ground
p1xl=p1x-w/2; p1xr=p1x+w/2;
line(aa,[p1xl,p1xr],[p1y,p1y],'Color',rgb{ii}); %stem from ground

%fixed stem
p2x=p1x; p2y=p1y+h; p2xl=p2x-w/2; p2xr=p2x+w/2;
line(aa,[p2xl,p2xr],[p2y,p2y],'Color',rgb{ii}); %stem to mass
line(aa,[p2xl,p2xl],[p2y,p2y-c],'Color',rgb{ii}); %coda left
line(aa,[p2xr,p2xr],[p2y,p2y-c],'Color',rgb{ii}); %coda right
p4y=p2y+l;
line(aa,[p2x,p2x],[p2y,p4y],'Color',rgb{ii}); %stem to mass
end

xlim([0,3*l]);
