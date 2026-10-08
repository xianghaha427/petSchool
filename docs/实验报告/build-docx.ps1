<#
    实验报告 Markdown -> Word (.docx) 生成器

    用法（在本目录下）：
        powershell -ExecutionPolicy Bypass -File .\build-docx.ps1

    可选参数：
        -Source <md 路径>   默认同目录下的「实验报告.md」
        -Output <docx 路径> 默认同目录下的「实验报告-00931.docx」

    设计说明：
      1. 样式一律使用 Word 内置样式的「数字常量」(-1/-2/-3/-4/-5)，
         不使用中文字符串名。本机 Word 的样式名是本地化的（「标题 1」），
         硬写字符串换一台机器就会失败。
      2. 生成结束后按 Ctrl+A -> F9 可刷新目录页码。
      3. 全程 try/finally，异常路径也会关文档、退 Word，不留孤儿进程。
#>
[CmdletBinding()]
param(
    [string]$Source,
    [string]$Output
)

$ErrorActionPreference = 'Stop'

if (-not $Source) { $Source = Join-Path $PSScriptRoot '实验报告.md' }
if (-not $Output) { $Output = '实验报告-00931.docx' }
# 允许只传文件名：一律解析到脚本所在目录，避免受调用方工作目录影响
if (-not [System.IO.Path]::IsPathRooted($Output)) { $Output = Join-Path $PSScriptRoot $Output }
if (-not (Test-Path -LiteralPath $Source)) { throw "找不到源文件：$Source" }

# ---------------------------------------------------------------- 常量
$STYLE_BODY = -1      # 正文
$STYLE_H1   = -2      # 标题 1
$STYLE_H2   = -3      # 标题 2
$STYLE_H3   = -4      # 标题 3
$STYLE_H4   = -5      # 标题 4
$STYLE_TBL  = -155    # 网格型表格

$ALIGN_LEFT   = 0
$ALIGN_CENTER = 1
$ALIGN_RIGHT  = 2

$STORY_END    = 6
$WD_PAGEBREAK = 7
$WD_FIELD_PAGE = 33
$NO_SHADE     = -16777216   # wdColorAutomatic
$NO_COLOR     = -16777216

$BODY_FONT  = '宋体'
$HEAD_FONT  = '黑体'
$CODE_FONT  = 'Consolas'
$CODE_CJK   = '新宋体'   # 等宽中文字体：Word 不接受把 Consolas 设成"中文字体"
$BODY_SIZE  = 12        # 小四
$CODE_SIZE  = 9
$TABLE_SIZE = 9

$CODE_SHADE  = 0xF4F4F4
$QUOTE_SHADE = 0xEFEFEF
$HEAD_SHADE  = 0xE4E4E4

# ---------------------------------------------------------------- 辅助函数
function Write-Inline {
    param($Sel, [string]$Text)
    if ([string]::IsNullOrEmpty($Text)) { return }

    # 正文里的标识符一律直接书写，不使用反引号包裹，也不切换等宽字体。
    # 这里先做一次兜底剥离：即便源文档残留了反引号（例如写在 **加粗** 内部），
    # 也不会漏进 Word 正文。
    $Text = $Text.Replace([string][char]0x60, '')

    # 只拆 **加粗** 一种片段，其余按普通文本输出
    $parts = [regex]::Split($Text, '(\*\*[^*]+\*\*)')
    foreach ($p in $parts) {
        if ([string]::IsNullOrEmpty($p)) { continue }
        if ($p -match '^\*\*(.+)\*\*$') {
            $Sel.Font.Bold = $true
            $Sel.TypeText($Matches[1])
            $Sel.Font.Bold = $false
        }
        else {
            $Sel.TypeText($p)
        }
    }
}

function Add-Paragraph {
    param(
        $Doc, $Sel,
        [string]$Text,
        [int]$StyleId     = -1,
        [int]$Align       = 0,
        [double]$FirstIndent = 24,
        [double]$LeftIndent  = 0,
        [double]$SpaceBefore = 0,
        [double]$SpaceAfter  = 0,
        [bool]$Bold       = $false,
        [bool]$Italic     = $false,
        [string]$FontName = '',
        [double]$FontSize = 0,
        [int]$Shade       = $NO_SHADE,
        [int]$LineRule    = 1,
        [bool]$Inline     = $true
    )
    if (-not $FontName) { $FontName = $script:BODY_FONT }
    if ($FontSize -le 0) { $FontSize = $script:BODY_SIZE }

    $Sel.Style = $Doc.Styles.Item($StyleId)
    $pf = $Sel.ParagraphFormat
    $pf.Alignment       = $Align
    $pf.FirstLineIndent = $FirstIndent
    $pf.LeftIndent      = $LeftIndent
    $pf.RightIndent     = 0
    $pf.SpaceBefore     = $SpaceBefore
    $pf.SpaceAfter      = $SpaceAfter
    $pf.LineSpacingRule = $LineRule
    $pf.Shading.BackgroundPatternColor = $Shade
    $f = $Sel.Font
    $f.Name = $FontName; $f.NameFarEast = $FontName
    $f.Size = $FontSize
    $f.Bold = $Bold
    $f.Italic = $Italic
    $f.Color = $NO_COLOR
    $f.Underline = 0

    if ($Inline) { Write-Inline -Sel $Sel -Text $Text } else { $Sel.TypeText($Text) }
    $Sel.TypeParagraph()
}

function Add-CodeLine {
    param($Doc, $Sel, [string]$Text)
    $Sel.Style = $Doc.Styles.Item($script:STYLE_BODY)
    $pf = $Sel.ParagraphFormat
    $pf.Alignment       = 0
    $pf.FirstLineIndent = 0
    $pf.LeftIndent      = 14
    $pf.RightIndent     = 0
    $pf.SpaceBefore     = 0
    $pf.SpaceAfter      = 0
    $pf.LineSpacingRule = 0          # 单倍行距
    $pf.Shading.BackgroundPatternColor = $script:CODE_SHADE
    $f = $Sel.Font
    $f.Name = $script:CODE_FONT
    try { $f.NameFarEast = $script:CODE_CJK } catch { }   # Consolas 没有中文字形，设进去会抛 0x800A16D4
    $f.Size = $script:CODE_SIZE
    $f.Bold = $false; $f.Italic = $false; $f.Underline = 0
    $f.Color = $NO_COLOR
    # 空行也要占位，否则代码块会被压缩掉空行
    if ([string]::IsNullOrEmpty($Text)) { $Text = ' ' }
    $Sel.TypeText($Text)
    $Sel.TypeParagraph()
}

function Add-Table {
    param($Doc, $Sel, $Rows)
    if ($null -eq $Rows -or $Rows.Count -eq 0) { return }

    $rowCount = $Rows.Count
    $colCount = 1
    foreach ($r in $Rows) { if ($r.Count -gt $colCount) { $colCount = $r.Count } }

    $Sel.EndKey($script:STORY_END) | Out-Null
    $tbl = $Doc.Tables.Add($Sel.Range, $rowCount, $colCount)
    try { $tbl.Style = $Doc.Styles.Item($script:STYLE_TBL) } catch { }
    $tbl.Borders.Enable = $true

    $tr = $tbl.Range
    $tr.Font.Name = $script:BODY_FONT; $tr.Font.NameFarEast = $script:BODY_FONT
    $tr.Font.Size = $script:TABLE_SIZE
    $tr.Font.Bold = $false
    $tr.ParagraphFormat.FirstLineIndent = 0
    $tr.ParagraphFormat.LeftIndent = 0
    $tr.ParagraphFormat.LineSpacingRule = 0
    $tr.ParagraphFormat.SpaceBefore = 1
    $tr.ParagraphFormat.SpaceAfter = 1

    for ($r = 0; $r -lt $rowCount; $r++) {
        for ($c = 0; $c -lt $colCount; $c++) {
            $txt = ''
            if ($c -lt $Rows[$r].Count) { $txt = [string]$Rows[$r][$c] }
            $txt = $txt -replace '\*\*', '' -replace '`', ''
            $tbl.Cell($r + 1, $c + 1).Range.Text = $txt
        }
    }

    # 首行作为表头：加粗、灰底、跨页重复
    try {
        $tbl.Rows.Item(1).HeadingFormat = $true
        $tbl.Rows.Item(1).Range.Font.Bold = $true
        $tbl.Rows.Item(1).Range.Shading.BackgroundPatternColor = $script:HEAD_SHADE
    } catch { }
    # 内容多的表格用 9pt，宽表自动适应窗口
    try { $tbl.AutoFitBehavior(2) } catch { }

    $Sel.EndKey($script:STORY_END) | Out-Null
    $Sel.TypeParagraph()
    $Sel.Style = $Doc.Styles.Item($script:STYLE_BODY)
}

# ---------------------------------------------------------------- 主流程
$lines = [System.IO.File]::ReadAllLines($Source, [System.Text.Encoding]::UTF8)
Write-Host "源文件：$Source（$($lines.Count) 行）"

$word = $null
$doc  = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0

    # 关闭"键入时自动套用格式"：否则引号会变弯引号、-- 会变破折号
    # 不同 Word 版本的 Options 成员并不一致（本机就没有 ReplaceHyphens），逐个容错
    foreach ($opt in @(
        'AutoFormatAsYouTypeReplaceQuotes',
        'AutoFormatAsYouTypeReplaceHyphens',
        'AutoFormatAsYouTypeApplyBulletedLists',
        'AutoFormatAsYouTypeApplyNumberedLists',
        'AutoFormatAsYouTypeFormatListItemBeginning',
        'AutoFormatAsYouTypeApplyTables'
    )) {
        try { $word.Options.$opt = $false } catch { }
    }

    $doc = $word.Documents.Add()
    $sel = $word.Selection

    # ---- 页面设置 ----
    $ps = $doc.PageSetup
    $ps.TopMargin    = $word.CentimetersToPoints(2.54)
    $ps.BottomMargin = $word.CentimetersToPoints(2.54)
    $ps.LeftMargin   = $word.CentimetersToPoints(3.17)
    $ps.RightMargin  = $word.CentimetersToPoints(3.17)

    # ---- 样式：正文宋体小四、1.5 倍行距 ----
    $s = $doc.Styles.Item($STYLE_BODY)
    $s.Font.Name = $BODY_FONT; $s.Font.NameFarEast = $BODY_FONT; $s.Font.Size = $BODY_SIZE
    $s.ParagraphFormat.LineSpacingRule = 1
    $s.ParagraphFormat.SpaceAfter = 0
    $s.ParagraphFormat.FirstLineIndent = 24

    # ---- 样式：各级标题黑体 ----
    foreach ($pair in @(@($STYLE_H1, 16), @($STYLE_H2, 15), @($STYLE_H3, 14), @($STYLE_H4, 12))) {
        $hs = $doc.Styles.Item($pair[0])
        $hs.Font.Name = $HEAD_FONT; $hs.Font.NameFarEast = $HEAD_FONT
        $hs.Font.Size = $pair[1]; $hs.Font.Bold = $true
        $hs.Font.Color = $NO_COLOR
        $hs.ParagraphFormat.FirstLineIndent = 0
        $hs.ParagraphFormat.LeftIndent = 0
        $hs.ParagraphFormat.SpaceBefore = 10
        $hs.ParagraphFormat.SpaceAfter = 6
        $hs.ParagraphFormat.KeepWithNext = $true
    }

    # ============================================================ 封面
    $sel.ParagraphFormat.FirstLineIndent = 0
    $sel.ParagraphFormat.LineSpacingRule = 0

    function Add-CoverLine {
        param($Doc, $Sel, [string]$Text, [double]$Size, [bool]$Bold, [int]$Align,
              [double]$LeftIndent = 0, [string]$FontName = '黑体')
        $Sel.Style = $Doc.Styles.Item($script:STYLE_BODY)
        $pf = $Sel.ParagraphFormat
        $pf.Alignment = $Align
        $pf.FirstLineIndent = 0
        $pf.LeftIndent = $LeftIndent
        $pf.SpaceBefore = 0
        $pf.SpaceAfter = 0
        $pf.LineSpacingRule = 0
        $pf.Shading.BackgroundPatternColor = $script:NO_SHADE
        $Sel.Font.Name = $FontName; $Sel.Font.NameFarEast = $FontName
        $Sel.Font.Size = $Size
        $Sel.Font.Bold = $Bold
        $Sel.Font.Color = $script:NO_COLOR
        if ([string]::IsNullOrEmpty($Text)) { $Text = ' ' }   # TypeText 不接受空串
        $Sel.TypeText($Text)
        $Sel.TypeParagraph()
    }

    for ($i = 0; $i -lt 6; $i++) { Add-CoverLine $doc $sel '' 12 $false $ALIGN_CENTER }
    Add-CoverLine $doc $sel '《团队规范实训》'   22 $true $ALIGN_CENTER
    Add-CoverLine $doc $sel ''                    12 $false $ALIGN_CENTER
    Add-CoverLine $doc $sel '个人项目实验报告'     26 $true $ALIGN_CENTER
    for ($i = 0; $i -lt 5; $i++) { Add-CoverLine $doc $sel '' 12 $false $ALIGN_CENTER }

    # 学号 / 姓名 / 班级 —— 留空，打印前手填
    $fillIndent = $word.CentimetersToPoints(5.5)
    foreach ($label in @('学号：', '姓名：', '班级：')) {
        Add-CoverLine $doc $sel $label 16 $false $ALIGN_LEFT $fillIndent $BODY_FONT
        Add-CoverLine $doc $sel ''     12 $false $ALIGN_LEFT 0 $BODY_FONT
    }

    for ($i = 0; $i -lt 5; $i++) { Add-CoverLine $doc $sel '' 12 $false $ALIGN_CENTER }
    Add-CoverLine $doc $sel '课程编号：00931' 14 $false $ALIGN_RIGHT 0 $BODY_FONT

    $sel.InsertBreak($WD_PAGEBREAK)

    # ============================================================ 目录
    Add-CoverLine $doc $sel '目　　录' 18 $true $ALIGN_CENTER
    Add-CoverLine $doc $sel '' 12 $false $ALIGN_CENTER

    $sel.Style = $doc.Styles.Item($STYLE_BODY)
    $sel.ParagraphFormat.FirstLineIndent = 0
    $toc = $doc.TablesOfContents.Add($sel.Range, $true, 1, 3)
    try {
        $toc.RightAlignPageNumbers = $true
        $toc.IncludePageNumbers = $true
        $toc.Update()
    } catch { }

    $sel.EndKey($STORY_END) | Out-Null
    $sel.InsertBreak($WD_PAGEBREAK)

    # ============================================================ 正文
    $inCode    = $false
    $tableRows = New-Object System.Collections.ArrayList

    foreach ($raw in $lines) {
        $line = $raw

        # ---- 代码块围栏 ----
        if ($line -match '^\s*```') {
            if ($inCode) {
                $inCode = $false
                # 收尾：把段落格式复位，避免影响后续正文
                $sel.Style = $doc.Styles.Item($STYLE_BODY)
                $sel.ParagraphFormat.FirstLineIndent = 0
                $sel.ParagraphFormat.LeftIndent = 0
                $sel.ParagraphFormat.Shading.BackgroundPatternColor = $NO_SHADE
                $sel.Font.Name = $BODY_FONT; $sel.Font.NameFarEast = $BODY_FONT
                $sel.Font.Size = $BODY_SIZE
                $sel.Font.Bold = $false
            }
            else { $inCode = $true }
            continue
        }

        if ($inCode) { Add-CodeLine $doc $sel $line; continue }

        # ---- 表格 ----
        if ($line -match '^\s*\|') {
            if ($line -match '^\s*\|[\s\-:\|]+\|\s*$') { continue }   # 分隔行 | --- |
            $cells = @(($line.Trim().Trim('|') -split '\|') | ForEach-Object { $_.Trim() })
            [void]$tableRows.Add($cells)
            continue
        }
        elseif ($tableRows.Count -gt 0) {
            Add-Table $doc $sel $tableRows.ToArray()
            $tableRows.Clear()
        }

        # ---- 空行 ----
        if ($line -match '^\s*$') { continue }

        # ---- 水平分隔线 ----
        if ($line -match '^\s*---+\s*$') { continue }

        # ---- 标题 ----
        if ($line -match '^(#{1,6})\s+(.*)$') {
            $level = $Matches[1].Length
            $text  = ($Matches[2].Trim() -replace '\*\*', '') -replace '`', ''
            switch ($level) {
                1       { $sid = $STYLE_H1; $al = $ALIGN_CENTER; $sp = 18 }
                2       { $sid = $STYLE_H2; $al = $ALIGN_LEFT;   $sp = 14 }
                3       { $sid = $STYLE_H3; $al = $ALIGN_LEFT;   $sp = 12 }
                default { $sid = $STYLE_H4; $al = $ALIGN_LEFT;   $sp = 10 }
            }
            Add-Paragraph -Doc $doc -Sel $sel -Text $text -StyleId $sid -Align $al `
                          -FirstIndent 0 -SpaceBefore $sp -SpaceAfter 6 `
                          -Bold $true -FontName $HEAD_FONT -Inline $false
            continue
        }

        # ---- 引用块（图位占位、提示）----
        if ($line -match '^>\s?(.*)$') {
            $text = $Matches[1]
            Add-Paragraph -Doc $doc -Sel $sel -Text $text -Align $ALIGN_LEFT `
                          -FirstIndent 0 -LeftIndent 21 -SpaceBefore 3 -SpaceAfter 3 `
                          -FontSize 11 -Shade $QUOTE_SHADE
            continue
        }

        # ---- 无序列表 ----
        if ($line -match '^\s*[-*]\s+(.*)$') {
            Add-Paragraph -Doc $doc -Sel $sel -Text ('· ' + $Matches[1]) `
                          -FirstIndent 0 -LeftIndent 21
            continue
        }

        # ---- 有序列表 ----
        if ($line -match '^\s*(\d+)\.\s+(.*)$') {
            Add-Paragraph -Doc $doc -Sel $sel -Text ($Matches[1] + '. ' + $Matches[2]) `
                          -FirstIndent 0 -LeftIndent 21
            continue
        }

        # ---- 普通正文 ----
        Add-Paragraph -Doc $doc -Sel $sel -Text $line
    }

    if ($tableRows.Count -gt 0) { Add-Table $doc $sel $tableRows.ToArray() }

    # ============================================================ 页脚页码
    try {
        $footer = $doc.Sections.Item(1).Footers.Item(1)
        $footer.Range.Text = ''
        $footer = $doc.Sections.Item(1).Footers.Item(1)
        $footer.Range.ParagraphFormat.Alignment = $ALIGN_CENTER
        $footer.Range.ParagraphFormat.FirstLineIndent = 0
        [void]$footer.Range.Fields.Add($footer.Range, $WD_FIELD_PAGE)
        $footer.Range.Font.Size = 10
        $footer.Range.Font.Name = $BODY_FONT
        $footer.Range.Font.NameFarEast = $BODY_FONT
    } catch { Write-Warning "页脚页码写入失败：$($_.Exception.Message)" }

    # ---- 刷新目录页码 ----
    try { $doc.TablesOfContents.Item(1).Update() } catch { }

    # ---- 保存 ----
    if (Test-Path -LiteralPath $Output) { Remove-Item -LiteralPath $Output -Force }
    $doc.SaveAs2($Output, 16)   # 16 = wdFormatDocumentDefault (.docx)

    $pageCount = $doc.ComputeStatistics(2)   # 2 = wdStatisticPages
    Write-Host ""
    Write-Host "已生成：$Output"
    Write-Host "页数：$pageCount"
    Write-Host "段落数：$($doc.Paragraphs.Count)   表格数：$($doc.Tables.Count)"
}
catch {
    Write-Host "!!! 失败于第 $($_.InvocationInfo.ScriptLineNumber) 行"
    Write-Host "!!! 语句：$($_.InvocationInfo.Line.Trim())"
    Write-Host "!!! 错误：$($_.Exception.Message)"
    throw
}
finally {
    if ($doc)  { try { $doc.Close(0) } catch { } }          # 0 = 不保存
    if ($word) { try { $word.Quit() } catch { } }
    if ($doc)  { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($doc) }
    if ($word) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
    [GC]::Collect(); [GC]::WaitForPendingFinalizers()
}
