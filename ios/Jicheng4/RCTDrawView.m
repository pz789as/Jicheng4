//
//  RCTDrawView.m
//  Jicheng1
//
//  Created by guojicheng on 16/8/24.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import "RCTDrawView.h"
#import "DrawView.h"

@interface RCTDrawView()
{
  UIColor *_backgroundColor;
}
@end

@implementation RCTDrawView

- (instancetype)init
{
  if ((self = [super init])) {
    self.drawView = [[DrawView alloc] initWithFrame:CGRectMake(0, 0, 320, 320)];
    _backgroundColor = self.backgroundColor;
  }
  
  return self;
}

-(void)layoutSubviews
{
  [super layoutSubviews];
  
  [self.drawView removeFromSuperview];
  
  self.drawView.frame = self.bounds;
  
  self.drawView.backgroundColor = _backgroundColor;
  
  [self insertSubview:self.drawView atIndex:0];
  
  [self.drawView setNeedsDisplay];
}

- (UIColor *)backgroundColor
{
  return _backgroundColor;
}

- (void)setBackgroundColor:(UIColor *)backgroundColor
{
  if ([_backgroundColor isEqual:backgroundColor]) {
    return;
  }
  
  _backgroundColor = backgroundColor;
  [self layoutSubviews];
}

-(void)setTransPos:(CGPoint)transPos
{
//  _transPos = transPos;
//  NSLog(@"%f,%f", _transPos.tx, _transPos.ty);
  
  self.drawView.transPos = transPos;
  [self layoutSubviews];
}

-(void)setScaleValue:(CGPoint)scaleValue
{
  //  _transPos = transPos;
  //  NSLog(@"%f,%f", _transPos.tx, _transPos.ty);
  
  self.drawView.scaleValue = scaleValue;
  [self layoutSubviews];
}

-(void)setDrawData:(NSDictionary *)drawData
{
  self.drawView.drawData = drawData;
//  NSLog(@"%lu", _drawData.count);
//  for (NSString *key in _drawData) {
//    NSLog(@"key: %@ value: %@", key, _drawData[key]);
//  }
  [self layoutSubviews];
}

@end
