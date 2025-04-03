# Commands

## Resize

```
ffmpeg -i INPUT -s 720x480 -c:a copy OUTPUT
```

## White Start Flash

```
ffmpeg -i input_video.mp4 -vf "\
curves=all='0/0 1/1':enable='gte(t,0.1)', \
curves=all='0/0 0.3/0.5 0.5/0.6 1/1':enable='between(t,0.1,0.2)', \
curves=all='0/0 0.25/0.5 0.3/0.6 1/1':enable='between(t,0.2,0.3)', \
curves=all='0/0 0.8/0.9 1/1':enable='between(t,0.3,0.4)', \
curves=all='0/0 1/1':enable='gte(t,0.4)', \
tblend=all_mode=average" output_video.mp4
```

## Fade Out From Black Effect

```
ffmpeg -i input_video.mp4 -vf "format=gbrp,split[a][b];[a][b]blend=all_expr='A*(sin(PI/2*min(1\,max(-1\,1/2*(T-3))))+1)/2':enable='lte(t,5)',format=yuv420p" output.mp4
```

## RGBA Phase Shift (3D Effect)

```
ffmpeg -i input_video.mp4 -vf rgbashift=rh=15:bv=15:gh=-15 -pix_fmt yuv420p output.mp4
```

## Night Vision Effect

```
ffmpeg -y -i input_video.mp4 -vf "colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3,colorbalance=0:.3:0:0:.3:0:0:.3:0,eq=contrast=1.9:brightness=0:saturation=1:gamma=1:gamma_r=1:gamma_g=1.4:gamma_b=1:gamma_weight=1" -pix_fmt yuv420p output.mp4
```

## Vintage TV Effect

```
ffmpeg -i input_video.mp4 -vf drawbox=t=20,drawgrid=h=10,boxblur=3:1,format=gbrp,lenscorrection=k1=0.1,format=yuv420p output.mp4
```

## Infrared Negative Effect

```
ffmpeg -i input_video.mp4 -vf eq=contrast=-1,colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3 -pix_fmt yuv420p output.mp4
```

## Chromatic Aberration Effect

```
ffmpeg -i input_video.mp4 -vf rgbashift=rh=20:bh=-20 -pix_fmt yuv420p output.mp4
```
